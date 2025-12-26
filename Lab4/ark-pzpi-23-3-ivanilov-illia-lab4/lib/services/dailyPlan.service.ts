import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/http/errors";
import { z } from "zod";

const normalizeToStartOfDay = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
};

const getActivityFactor = (activityLevel?: string | null): number => {
    switch (activityLevel) {
        case "low": return 1.0;
        case "medium": return 1.1;
        case "high": return 1.2;
        default: return 1.0;
    }
};

const getGoalFactor = (goalType?: string | null): number => {
    switch (goalType) {
        case "lose_weight": return 1.05;
        case "gain_muscle": return 1.1;
        case "maintain": return 1.0;
        default: return 1.0;
    }
};

export const calculateTargetMl = (
    weightKg?: number | null,
    activityLevel?: string | null,
    goalType?: string | null
): number | null => {
    if (!weightKg) return null;
    const activityFactor = getActivityFactor(activityLevel);
    const goalFactor = getGoalFactor(goalType);
    return Math.round((weightKg * 35 * activityFactor * goalFactor) / 100) * 100;
};

export const calculateAmountOfIntakes = (targetMl: number | null): number | null => {
    if (!targetMl) return null;
    return Math.round(targetMl / 250);
};

export const calculateDeviationMl = async (
    dailyplanId: number,
    totalIntakeMl: number
): Promise<number | null> => {
    const plan = await prisma.dailyPlan.findUnique({
        where: { dailyplan_id: dailyplanId },
    });

    if (!plan || !plan.target) return null;

    const now = new Date();
    const planStartOfDay = normalizeToStartOfDay(plan.date);
    const elapsedMs = now.getTime() - planStartOfDay.getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);

    if (elapsedHours < 0) {
        return Math.round(totalIntakeMl / 100) * 100;
    }

    const activeHours = Math.min(elapsedHours, 24);
    const expectedMl = (plan.target / 24) * activeHours;
    const deviation = totalIntakeMl - expectedMl;
    return Math.round(deviation / 100) * 100;
};

const createDailyPlanSchema = z.object({
    user_id: z.number().int(),
    date: z
        .union([z.string().datetime(), z.date()])
        .optional()
        .transform((val) => {
            const date = val ? (val instanceof Date ? val : new Date(val)) : new Date();
            return normalizeToStartOfDay(date);
        }),
    target: z.number().optional(),
    total_intake_ml: z.number().optional(),
    deviation_ml: z.number().optional(),
    amount_of_intakes: z.number().int().optional(),
});

const updateDailyPlanSchema = z.object({
    user_id: z.number().int().optional(),
    date: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? normalizeToStartOfDay(new Date(val)) : undefined)),
    target: z.number().optional(),
    total_intake_ml: z.number().optional(),
    deviation_ml: z.number().optional(),
    amount_of_intakes: z.number().int().optional(),
});

export type CreateDailyPlanInput = z.infer<typeof createDailyPlanSchema>;
export type UpdateDailyPlanInput = z.infer<typeof updateDailyPlanSchema>;

export const dailyPlanService = {
    async findAll(filters?: { user_id?: number; date?: string }) {
        const where: any = {};
        if (filters?.user_id !== undefined) {
            where.user_id = filters.user_id;
        }
        if (filters?.date) {
            const date = new Date(filters.date);
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            where.date = { gte: startOfDay, lte: endOfDay };
        }
        return prisma.dailyPlan.findMany({ where });
    },

    async findById(id: number) {
        const plan = await prisma.dailyPlan.findUnique({
            where: { dailyplan_id: id },
        });
        if (!plan) {
            throw new NotFoundError("DailyPlan", id.toString());
        }
        return plan;
    },

    async create(data: unknown) {
        const validated = createDailyPlanSchema.parse(data);
        const user = await prisma.user.findUnique({
            where: { user_id: validated.user_id },
        });
        if (!user) {
            throw new NotFoundError("User", validated.user_id.toString());
        }

        const plan = await prisma.dailyPlan.create({
            data: {
                user_id: validated.user_id,
                date: validated.date,
                target: validated.target,
                total_intake_ml: validated.total_intake_ml || 0,
                deviation_ml: validated.deviation_ml,
                amount_of_intakes: validated.amount_of_intakes,
            },
        });

        if (plan.target) {
            const recalculatedDeviation = await calculateDeviationMl(
                plan.dailyplan_id,
                plan.total_intake_ml || 0
            );
            if (recalculatedDeviation !== null && recalculatedDeviation !== plan.deviation_ml) {
                return this.update(plan.dailyplan_id, {
                    deviation_ml: recalculatedDeviation,
                });
            }
        }

        return plan;
    },

    async update(id: number, data: unknown) {
        await this.findById(id);
        const validated = updateDailyPlanSchema.parse(data);
        if (validated.user_id !== undefined) {
            const user = await prisma.user.findUnique({
                where: { user_id: validated.user_id },
            });
            if (!user) {
                throw new NotFoundError("User", validated.user_id.toString());
            }
        }
        return prisma.dailyPlan.update({
            where: { dailyplan_id: id },
            data: validated,
        });
    },

    async delete(id: number) {
        await this.findById(id);
        await prisma.dailyPlan.delete({
            where: { dailyplan_id: id },
        });
    },

    async recalculateFromIntakes(dailyplanId: number) {
        await this.findById(dailyplanId);

        const intakes = await prisma.intake.findMany({
            where: { dailyplan_id: dailyplanId },
        });

        const totalIntakeMl = intakes.reduce(
            (sum, intake) => sum + (intake.volume_ml || 0),
            0
        );

        const deviationMl = await calculateDeviationMl(dailyplanId, totalIntakeMl);

        return this.update(dailyplanId, {
            total_intake_ml: totalIntakeMl,
            deviation_ml: deviationMl,
        });
    },

    async recalculateFromActivities(dailyplanId: number) {
        const plan = await this.findById(dailyplanId);

        const activities = await prisma.activity.findMany({
            where: { dailyplan_id: dailyplanId },
        });

        const totalWaterBonusMl = activities.reduce(
            (sum, activity) => sum + (activity.water_bonus_ml || 0),
            0
        );

        const profile = await prisma.userProfile.findFirst({
            where: { user_id: plan.user_id },
        });

        if (!profile) {
            const newTarget = (plan.target || 0) + totalWaterBonusMl;
            await this.update(dailyplanId, {
                target: newTarget > 0 ? newTarget : null,
            });
            await this.recalculateFromIntakes(dailyplanId);
            return;
        }

        const baseTarget = calculateTargetMl(
            profile.weight,
            profile.activity_level,
            profile.goal_type
        );

        const newTarget = (baseTarget || 0) + totalWaterBonusMl;

        await this.update(dailyplanId, {
            target: newTarget > 0 ? newTarget : null,
        });

        await this.recalculateFromIntakes(dailyplanId);
    },

    async findOrCreateToday(userId: number, profile: {
        weight?: number | null;
        activity_level?: string | null;
        goal_type?: string | null;
    }) {
        const today = normalizeToStartOfDay(new Date());

        const existingPlan = await prisma.dailyPlan.findFirst({
            where: {
                user_id: userId,
                date: today,
            },
        });

        const target = calculateTargetMl(
            profile.weight,
            profile.activity_level,
            profile.goal_type
        );
        const amountOfIntakes = calculateAmountOfIntakes(target);

        if (existingPlan) {
            await this.update(existingPlan.dailyplan_id, {
                amount_of_intakes: amountOfIntakes,
            });
            await this.recalculateFromActivities(existingPlan.dailyplan_id);
            return this.findById(existingPlan.dailyplan_id);
        }

        const todayUTC = new Date(Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate(),
            0, 0, 0, 0
        ));

        return this.create({
            user_id: userId,
            date: todayUTC.toISOString(),
            target,
            total_intake_ml: 0,
            deviation_ml: 0,
            amount_of_intakes: amountOfIntakes,
        });
    },
};
