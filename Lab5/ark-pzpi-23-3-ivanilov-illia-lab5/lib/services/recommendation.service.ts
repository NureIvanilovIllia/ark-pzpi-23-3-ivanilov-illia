import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/http/errors";
import { z } from "zod";

export enum RecommendationType {
    LATE_BEHIND = "LATE_BEHIND",
    STRONG_BEHIND = "STRONG_BEHIND",
    TOO_LARGE_PORTION = "TOO_LARGE_PORTION",
    ACTIVITY_EXTRA_WATER = "ACTIVITY_EXTRA_WATER",
    GOOD_PACE = "GOOD_PACE",
    EXCELLENT_PACE = "EXCELLENT_PACE",
    TOO_RARE_INTAKES = "TOO_RARE_INTAKES",
}

const RECOMMENDATION_CONFIGS = {
    [RecommendationType.LATE_BEHIND]: {
        message: "Ви відстаєте від графіка. Спробуйте випити невелику порцію води зараз.",
        severity: "medium",
    },
    [RecommendationType.STRONG_BEHIND]: {
        message: "Ви сильно відстаєте від графіка. Необхідно випити більше води негайно.",
        severity: "high",
    },
    [RecommendationType.TOO_LARGE_PORTION]: {
        message: "Ви п'єте занадто великими порціями. Менші, але часті прийоми краще засвоюються.",
        severity: "medium",
    },
    [RecommendationType.ACTIVITY_EXTRA_WATER]: {
        message: "Після фізичної активності рекомендовано додатково випити воду для відновлення.",
        severity: "medium",
    },
    [RecommendationType.GOOD_PACE]: {
        message: "Ви добре дотримуєтесь графіка! Продовжуйте в тому ж дусі.",
        severity: "low",
    },
    [RecommendationType.EXCELLENT_PACE]: {
        message: "Відмінно! Ви випереджаєте графік. Так тримати!",
        severity: "low",
    },
    [RecommendationType.TOO_RARE_INTAKES]: {
        message: "Ви рідко п'єте воду. Рекомендовано приймати воду частіше, невеликими порціями.",
        severity: "medium",
    },
};

const createRecommendationSchema = z.object({
    intake_id: z.number().int(),
    recommend_type: z.string().optional(),
    message: z.string().optional(),
    severity: z.string().optional(),
});

const updateRecommendationSchema = z.object({
    intake_id: z.number().int().optional(),
    recommend_type: z.string().optional(),
    message: z.string().optional(),
    severity: z.string().optional(),
});

export type CreateRecommendationInput = z.infer<typeof createRecommendationSchema>;
export type UpdateRecommendationInput = z.infer<typeof updateRecommendationSchema>;

const hasRecentRecommendation = async (
    intakeId: number,
    type: RecommendationType
): Promise<boolean> => {
    const recent = await prisma.recommendation.findFirst({
        where: {
            intake_id: intakeId,
            recommend_type: type,
        },
        orderBy: { recommendation_id: "desc" },
    });
    return !!recent;
};

export const recommendationService = {
    async findAll(filters?: {
        intake_id?: number;
        severity?: string;
        recommend_type?: string;
    }) {
        const where: any = {};
        if (filters?.intake_id !== undefined) {
            where.intake_id = filters.intake_id;
        }
        if (filters?.severity) {
            where.severity = filters.severity;
        }
        if (filters?.recommend_type) {
            where.recommend_type = filters.recommend_type;
        }
        return prisma.recommendation.findMany({ where });
    },

    async findById(id: number) {
        const recommendation = await prisma.recommendation.findUnique({
            where: { recommendation_id: id },
        });
        if (!recommendation) {
            throw new NotFoundError("Recommendation", id.toString());
        }
        return recommendation;
    },

    async create(data: unknown) {
        const validated = createRecommendationSchema.parse(data);
        const intake = await prisma.intake.findUnique({
            where: { intake_id: validated.intake_id },
        });
        if (!intake) {
            throw new NotFoundError("Intake", validated.intake_id.toString());
        }
        return prisma.recommendation.create({
            data: validated,
        });
    },

    async update(id: number, data: unknown) {
        await this.findById(id);
        const validated = updateRecommendationSchema.parse(data);
        if (validated.intake_id !== undefined) {
            const intake = await prisma.intake.findUnique({
                where: { intake_id: validated.intake_id },
            });
            if (!intake) {
                throw new NotFoundError("Intake", validated.intake_id.toString());
            }
        }
        return prisma.recommendation.update({
            where: { recommendation_id: id },
            data: validated,
        });
    },

    async delete(id: number) {
        await this.findById(id);
        await prisma.recommendation.delete({
            where: { recommendation_id: id },
        });
    },

    async createRecommendationsForIntake(intakeId: number) {
        const intake = await prisma.intake.findUnique({
            where: { intake_id: intakeId },
            include: { dailyPlan: true },
        });

        if (!intake?.dailyPlan) {
            return [];
        }

        const plan = intake.dailyPlan;
        const recommendations: any[] = [];

        if (plan.deviation_ml !== null && plan.deviation_ml < -400) {
            if (!(await hasRecentRecommendation(intakeId, RecommendationType.LATE_BEHIND))) {
                recommendations.push({
                    intake_id: intakeId,
                    recommend_type: RecommendationType.LATE_BEHIND,
                    message: RECOMMENDATION_CONFIGS[RecommendationType.LATE_BEHIND].message,
                    severity: RECOMMENDATION_CONFIGS[RecommendationType.LATE_BEHIND].severity,
                });
            }
        }

        if (plan.deviation_ml !== null && plan.deviation_ml < -800) {
            if (!(await hasRecentRecommendation(intakeId, RecommendationType.STRONG_BEHIND))) {
                recommendations.push({
                    intake_id: intakeId,
                    recommend_type: RecommendationType.STRONG_BEHIND,
                    message: RECOMMENDATION_CONFIGS[RecommendationType.STRONG_BEHIND].message,
                    severity: RECOMMENDATION_CONFIGS[RecommendationType.STRONG_BEHIND].severity,
                });
            }
        }

        if (intake.volume_ml && intake.volume_ml > 400) {
            recommendations.push({
                intake_id: intakeId,
                recommend_type: RecommendationType.TOO_LARGE_PORTION,
                message: RECOMMENDATION_CONFIGS[RecommendationType.TOO_LARGE_PORTION].message,
                severity: RECOMMENDATION_CONFIGS[RecommendationType.TOO_LARGE_PORTION].severity,
            });
        }

        if (plan.deviation_ml !== null && plan.deviation_ml >= -100 && plan.deviation_ml <= 100) {
            if (!(await hasRecentRecommendation(intakeId, RecommendationType.GOOD_PACE))) {
                recommendations.push({
                    intake_id: intakeId,
                    recommend_type: RecommendationType.GOOD_PACE,
                    message: RECOMMENDATION_CONFIGS[RecommendationType.GOOD_PACE].message,
                    severity: RECOMMENDATION_CONFIGS[RecommendationType.GOOD_PACE].severity,
                });
            }
        }

        if (plan.deviation_ml !== null && plan.deviation_ml > 0 && plan.deviation_ml < 200) {
            if (!(await hasRecentRecommendation(intakeId, RecommendationType.EXCELLENT_PACE))) {
                recommendations.push({
                    intake_id: intakeId,
                    recommend_type: RecommendationType.EXCELLENT_PACE,
                    message: RECOMMENDATION_CONFIGS[RecommendationType.EXCELLENT_PACE].message,
                    severity: RECOMMENDATION_CONFIGS[RecommendationType.EXCELLENT_PACE].severity,
                });
            }
        }

        if (intake.intake_time) {
            const previousIntake = await prisma.intake.findFirst({
                where: {
                    dailyplan_id: intake.dailyplan_id,
                    intake_time: { lt: intake.intake_time },
                },
                orderBy: { intake_time: "desc" },
            });

            if (previousIntake?.intake_time) {
                const timeDiffMinutes =
                    (intake.intake_time.getTime() - previousIntake.intake_time.getTime()) / (1000 * 60);

                if (timeDiffMinutes > 120) {
                    recommendations.push({
                        intake_id: intakeId,
                        recommend_type: RecommendationType.TOO_RARE_INTAKES,
                        message: RECOMMENDATION_CONFIGS[RecommendationType.TOO_RARE_INTAKES].message,
                        severity: RECOMMENDATION_CONFIGS[RecommendationType.TOO_RARE_INTAKES].severity,
                    });
                }
            }
        }

        const created = await Promise.all(
            recommendations.map((rec) => prisma.recommendation.create({ data: rec }))
        );

        for (const recommendation of created) {
            await this.createNotificationForRecommendation(recommendation.recommendation_id);
        }

        return created;
    },

    async createRecommendationsForActivity(activityId: number) {
        const activity = await prisma.activity.findUnique({
            where: { activity_id: activityId },
            include: { dailyPlan: true },
        });

        if (!activity?.dailyPlan || !activity.water_bonus_ml || activity.water_bonus_ml <= 300) {
            return [];
        }

        const lastIntake = await prisma.intake.findFirst({
            where: { dailyplan_id: activity.dailyplan_id },
            orderBy: { intake_time: "desc" },
        });

        if (!lastIntake) {
            return [];
        }

        if (await hasRecentRecommendation(lastIntake.intake_id, RecommendationType.ACTIVITY_EXTRA_WATER)) {
            return [];
        }

        const recommendation = await prisma.recommendation.create({
            data: {
                intake_id: lastIntake.intake_id,
                recommend_type: RecommendationType.ACTIVITY_EXTRA_WATER,
                message: RECOMMENDATION_CONFIGS[RecommendationType.ACTIVITY_EXTRA_WATER].message,
                severity: RECOMMENDATION_CONFIGS[RecommendationType.ACTIVITY_EXTRA_WATER].severity,
            },
        });

        await this.createNotificationForRecommendation(recommendation.recommendation_id);

        return [recommendation];
    },

    async createNotificationForRecommendation(recommendationId: number) {
        const recommendation = await prisma.recommendation.findUnique({
            where: { recommendation_id: recommendationId },
        });

        if (!recommendation?.severity || (recommendation.severity !== "medium" && recommendation.severity !== "high")) {
            return null;
        }

        const notificationType = recommendation.severity === "medium" ? "warning" : "urgent";

        const titleMap: Record<string, string> = {
            [RecommendationType.LATE_BEHIND]: "Відставання від графіка",
            [RecommendationType.STRONG_BEHIND]: "Сильне відставання від графіка",
            [RecommendationType.TOO_LARGE_PORTION]: "Занадто велика порція",
            [RecommendationType.ACTIVITY_EXTRA_WATER]: "Після фізичної активності",
            [RecommendationType.TOO_RARE_INTAKES]: "Рідкі прийоми води",
        };

        const title = titleMap[recommendation.recommend_type || ""] || "Рекомендація по воді";

        return prisma.notification.create({
            data: {
                recommendation_id: recommendationId,
                notification_type: notificationType,
                title: title,
                body: recommendation.message || "",
                channel: "push",
                status: "sent",
                sent_at: new Date(),
            },
        });
    },
};
