import { prisma } from "@/lib/prisma";

const groupByDay = (validPlans: any[]) => {
    const dayGroups = new Map<string, { target: number; intake: number; count: number }>();

    validPlans.forEach((plan) => {
        const dayKey = plan.date.toISOString().split("T")[0];
        const existing = dayGroups.get(dayKey) || { target: 0, intake: 0, count: 0 };
        dayGroups.set(dayKey, {
            target: existing.target + (plan.target || 0),
            intake: existing.intake + (plan.total_intake_ml || 0),
            count: existing.count + 1,
        });
    });

    return Array.from(dayGroups.entries()).map(([day, data]) => ({
        group: day,
        average_target: data.target / data.count,
        average_intake: data.intake / data.count,
        completion_percentage: data.target > 0 ? (data.intake / data.target) * 100 : 0,
        count: data.count,
    }));
};

const groupByUser = (validPlans: any[]) => {
    const userGroups = new Map<number, { target: number; intake: number; count: number }>();

    validPlans.forEach((plan) => {
        const existing = userGroups.get(plan.user_id) || { target: 0, intake: 0, count: 0 };
        userGroups.set(plan.user_id, {
            target: existing.target + (plan.target || 0),
            intake: existing.intake + (plan.total_intake_ml || 0),
            count: existing.count + 1,
        });
    });

    return Array.from(userGroups.entries()).map(([userId, data]) => ({
        user_id: userId,
        average_target: data.target / data.count,
        average_intake: data.intake / data.count,
        completion_percentage: data.target > 0 ? (data.intake / data.target) * 100 : 0,
        count: data.count,
    }));
};

const groupByActivityLevel = (validPlans: any[]) => {
    const activityGroups = new Map<string, { target: number; intake: number; count: number }>();

    validPlans.forEach((plan) => {
        const profile = plan.user.profiles[0];
        const activityLevel = profile?.activity_level || "unknown";
        const existing = activityGroups.get(activityLevel) || { target: 0, intake: 0, count: 0 };
        activityGroups.set(activityLevel, {
            target: existing.target + (plan.target || 0),
            intake: existing.intake + (plan.total_intake_ml || 0),
            count: existing.count + 1,
        });
    });

    return Array.from(activityGroups.entries()).map(([level, data]) => ({
        activity_level: level,
        average_target: data.target / data.count,
        average_intake: data.intake / data.count,
        completion_percentage: data.target > 0 ? (data.intake / data.target) * 100 : 0,
        count: data.count,
    }));
};

export const statisticsService = {
    async getWaterConsumptionStats(filters?: {
        user_id?: number;
        from_date?: string;
        to_date?: string;
        group_by?: "day" | "user" | "activity_level";
    }) {
        const where: any = {};

        if (filters?.user_id) {
            where.user_id = filters.user_id;
        }

        if (filters?.from_date || filters?.to_date) {
            where.date = {};
            if (filters?.from_date) {
                where.date.gte = new Date(filters.from_date);
            }
            if (filters?.to_date) {
                const toDate = new Date(filters.to_date);
                toDate.setHours(23, 59, 59, 999);
                where.date.lte = toDate;
            }
        }

        const plans = await prisma.dailyPlan.findMany({
            where,
            include: {
                user: {
                    include: {
                        profiles: { take: 1 },
                    },
                },
            },
        });

        const validPlans = plans.filter(
            (plan) => plan.target !== null && plan.total_intake_ml !== null
        );

        if (validPlans.length === 0) {
            return {
                average_target: 0,
                average_intake: 0,
                average_intake_per_portion: 0,
                completion_percentage: 0,
                breakdown: [],
            };
        }

        const totalTarget = validPlans.reduce((sum, plan) => sum + (plan.target || 0), 0);
        const totalIntake = validPlans.reduce(
            (sum, plan) => sum + (plan.total_intake_ml || 0),
            0
        );
        const averageTarget = totalTarget / validPlans.length;
        const averageIntake = totalIntake / validPlans.length;
        const completionPercentage =
            totalTarget > 0 ? (totalIntake / totalTarget) * 100 : 0;

        const allIntakes = await prisma.intake.findMany({
            where: {
                dailyplan_id: { in: validPlans.map((p) => p.dailyplan_id) },
            },
        });

        const validIntakes = allIntakes.filter((i) => i.volume_ml !== null && i.volume_ml !== undefined);
        const averageIntakePerPortion =
            validIntakes.length > 0
                ? validIntakes.reduce((sum, i) => sum + (i.volume_ml || 0), 0) / validIntakes.length
                : 0;

        let breakdown: any[] = [];

        if (filters?.group_by === "day") {
            breakdown = groupByDay(validPlans);
        } else if (filters?.group_by === "user") {
            breakdown = groupByUser(validPlans);
        } else if (filters?.group_by === "activity_level") {
            breakdown = groupByActivityLevel(validPlans);
        }

        return {
            average_target: Math.round(averageTarget),
            average_intake: Math.round(averageIntake),
            average_intake_per_portion: Math.round(averageIntakePerPortion),
            completion_percentage: Math.round(completionPercentage * 100) / 100,
            breakdown: breakdown.sort((a, b) => {
                if (filters?.group_by === "day") {
                    return a.group.localeCompare(b.group);
                }
                return 0;
            }),
        };
    },

    async getActivityStats(filters?: {
        user_id?: number;
        from_date?: string;
        to_date?: string;
    }) {
        const where: any = {};

        if (filters?.user_id) {
            where.dailyPlan = { user_id: filters.user_id };
        }

        if (filters?.from_date || filters?.to_date) {
            where.dailyPlan = {
                ...where.dailyPlan,
                date: {},
            };
            if (filters?.from_date) {
                where.dailyPlan.date.gte = new Date(filters.from_date);
            }
            if (filters?.to_date) {
                const toDate = new Date(filters.to_date);
                toDate.setHours(23, 59, 59, 999);
                where.dailyPlan.date.lte = toDate;
            }
        }

        const activities = await prisma.activity.findMany({
            where,
            include: {
                dailyPlan: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (activities.length === 0) {
            return {
                average_activities_per_user: 0,
                popular_activity_types: [],
                average_water_bonus: 0,
            };
        }

        const userActivityCounts = new Map<number, number>();
        activities.forEach((activity) => {
            const userId = activity.dailyPlan.user_id;
            userActivityCounts.set(userId, (userActivityCounts.get(userId) || 0) + 1);
        });

        const totalUsers = userActivityCounts.size;
        const averageActivitiesPerUser =
            totalUsers > 0 ? activities.length / totalUsers : 0;

        const activityTypeCounts = new Map<string, number>();
        activities.forEach((activity) => {
            const type = activity.activity_type || "unknown";
            activityTypeCounts.set(type, (activityTypeCounts.get(type) || 0) + 1);
        });

        const popularActivityTypes = Array.from(activityTypeCounts.entries())
            .map(([type, count]) => ({
                activity_type: type,
                count: count,
                percentage: (count / activities.length) * 100,
            }))
            .sort((a, b) => b.count - a.count);

        const validWaterBonuses = activities
            .map((a) => a.water_bonus_ml)
            .filter((b): b is number => b !== null && b !== undefined);
        const averageWaterBonus =
            validWaterBonuses.length > 0
                ? validWaterBonuses.reduce((sum, b) => sum + b, 0) / validWaterBonuses.length
                : 0;

        return {
            average_activities_per_user: Math.round(averageActivitiesPerUser * 100) / 100,
            popular_activity_types: popularActivityTypes,
            average_water_bonus: Math.round(averageWaterBonus),
        };
    },
};
