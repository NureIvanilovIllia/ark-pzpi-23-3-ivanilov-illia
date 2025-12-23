import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/http/errors";
import { z } from "zod";

const createDailyPlanSchema = z.object({
    user_id: z.number().int(),
    date: z
        .string()
        .datetime()
        .transform((val) => new Date(val)),
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
        .transform((val) => (val ? new Date(val) : undefined)),
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
            where.date = {
                gte: startOfDay,
                lte: endOfDay,
            };
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
        return prisma.dailyPlan.create({
            data: validated,
        });
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
        return prisma.dailyPlan.delete({
            where: { dailyplan_id: id },
        });
    },
};
