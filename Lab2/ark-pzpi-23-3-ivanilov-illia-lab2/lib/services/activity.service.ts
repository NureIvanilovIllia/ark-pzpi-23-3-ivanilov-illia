import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/http/errors";
import { z } from "zod";

const createActivitySchema = z.object({
    dailyplan_id: z.number().int(),
    activity_type: z.string().optional(),
    intensity: z.string().optional(),
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
    duration: z.number().int().optional(),
    extra_hydration_ml: z.number().optional(),
});

const updateActivitySchema = z.object({
    dailyplan_id: z.number().int().optional(),
    activity_type: z.string().optional(),
    intensity: z.string().optional(),
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
    duration: z.number().int().optional(),
    extra_hydration_ml: z.number().optional(),
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
        return prisma.activity.create({
            data: validated,
        });
    },

    async update(id: number, data: unknown) {
        await this.findById(id);
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
        return prisma.activity.update({
            where: { activity_id: id },
            data: validated,
        });
    },

    async delete(id: number) {
        await this.findById(id);
        return prisma.activity.delete({
            where: { activity_id: id },
        });
    },
};
