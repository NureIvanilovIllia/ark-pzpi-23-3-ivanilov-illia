import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/http/errors";
import { z } from "zod";
import { dailyPlanService } from "./dailyPlan.service";
import { recommendationService } from "./recommendation.service";

const ACTIVITY_TYPES = [
    "running",
    "cycling",
    "swimming",
    "walking",
    "gym",
    "yoga",
    "dancing",
    "hiking",
    "tennis",
    "basketball",
    "football",
    "other",
] as const;

const getIntensityFactor = (intensity?: string | null): number => {
    switch (intensity) {
        case "low": return 4;
        case "medium": return 7;
        case "high": return 10;
        default: return 0;
    }
};

const calculateWaterBonusMl = (
    durationMin?: number | null,
    intensity?: string | null
): number | null => {
    if (!durationMin || !intensity) return null;
    return durationMin * getIntensityFactor(intensity);
};

const timeValidation = (data: { start_time?: Date; end_time?: Date }) => {
    if (data.start_time && data.end_time) {
        return data.start_time < data.end_time;
    }
    return true;
};

const createActivitySchema = z
    .object({
        dailyplan_id: z.number().int(),
        activity_type: z.enum(ACTIVITY_TYPES).optional(),
        intensity: z.enum(["low", "medium", "high"]).optional(),
        start_time: z
            .string()
            .datetime()
            .optional()
            .transform((val) => (val ? new Date(val) : undefined)),
        end_time: z
            .string()
            .datetime()
            .optional()
            .transform((val) => (val ? new Date(val) : undefined)),
        duration_min: z.number().int().positive().optional(),
    })
    .refine(timeValidation, {
        message: "start_time must be less than end_time",
        path: ["start_time"],
    });

const updateActivitySchema = z
    .object({
        dailyplan_id: z.number().int().optional(),
        activity_type: z.enum(ACTIVITY_TYPES).optional(),
        intensity: z.enum(["low", "medium", "high"]).optional(),
        start_time: z
            .string()
            .datetime()
            .optional()
            .transform((val) => (val ? new Date(val) : undefined)),
        end_time: z
            .string()
            .datetime()
            .optional()
            .transform((val) => (val ? new Date(val) : undefined)),
        duration_min: z.number().int().positive().optional(),
    })
    .refine(timeValidation, {
        message: "start_time must be less than end_time",
        path: ["start_time"],
    });

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

export const activityService = {
    async findAll(filters?: { dailyplan_id?: number }) {
        const where: any = {};
        if (filters?.dailyplan_id !== undefined) {
            where.dailyplan_id = filters.dailyplan_id;
        }
        return prisma.activity.findMany({ where });
    },

    async findById(id: number) {
        const activity = await prisma.activity.findUnique({
            where: { activity_id: id },
        });
        if (!activity) {
            throw new NotFoundError("Activity", id.toString());
        }
        return activity;
    },

    async create(data: unknown) {
        const validated = createActivitySchema.parse(data);
        const dailyPlan = await prisma.dailyPlan.findUnique({
            where: { dailyplan_id: validated.dailyplan_id },
        });
        if (!dailyPlan) {
            throw new NotFoundError(
                "DailyPlan",
                validated.dailyplan_id.toString()
            );
        }

        const waterBonusMl = calculateWaterBonusMl(
            validated.duration_min,
            validated.intensity
        );

        const activity = await prisma.activity.create({
            data: {
                dailyplan_id: validated.dailyplan_id,
                activity_type: validated.activity_type,
                intensity: validated.intensity,
                start_time: validated.start_time,
                end_time: validated.end_time,
                duration_min: validated.duration_min,
                water_bonus_ml: waterBonusMl,
            },
        });

        await dailyPlanService.recalculateFromActivities(
            validated.dailyplan_id
        );
        await recommendationService.createRecommendationsForActivity(activity.activity_id);

        return activity;
    },

    async update(id: number, data: unknown) {
        const existingActivity = await this.findById(id);
        const validated = updateActivitySchema.parse(data);
        if (validated.dailyplan_id !== undefined) {
            const dailyPlan = await prisma.dailyPlan.findUnique({
                where: { dailyplan_id: validated.dailyplan_id },
            });
            if (!dailyPlan) {
                throw new NotFoundError(
                    "DailyPlan",
                    validated.dailyplan_id.toString()
                );
            }
        }

        const durationMin =
            validated.duration_min ?? existingActivity.duration_min;
        const intensity = validated.intensity ?? existingActivity.intensity;
        const waterBonusMl = calculateWaterBonusMl(durationMin, intensity);

        const updatedActivity = await prisma.activity.update({
            where: { activity_id: id },
            data: {
                ...validated,
                water_bonus_ml: waterBonusMl,
            },
        });

        await dailyPlanService.recalculateFromActivities(
            existingActivity.dailyplan_id
        );
        if (
            validated.dailyplan_id !== undefined &&
            validated.dailyplan_id !== existingActivity.dailyplan_id
        ) {
            await dailyPlanService.recalculateFromActivities(
                validated.dailyplan_id
            );
        }

        return updatedActivity;
    },

    async delete(id: number) {
        const activity = await this.findById(id);
        const dailyplanId = activity.dailyplan_id;

        await prisma.activity.delete({
            where: { activity_id: id },
        });

        await dailyPlanService.recalculateFromActivities(dailyplanId);
    },
};
