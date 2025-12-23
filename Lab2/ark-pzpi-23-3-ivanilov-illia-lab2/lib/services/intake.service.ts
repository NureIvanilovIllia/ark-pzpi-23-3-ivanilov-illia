import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/http/errors";
import { z } from "zod";

const createIntakeSchema = z.object({
    dailyplan_id: z.number().int(),
    volume_ml: z.number().optional(),
    intake_time: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
});

const updateIntakeSchema = z.object({
    dailyplan_id: z.number().int().optional(),
    volume_ml: z.number().optional(),
    intake_time: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
});

export type CreateIntakeInput = z.infer<typeof createIntakeSchema>;
export type UpdateIntakeInput = z.infer<typeof updateIntakeSchema>;

export const intakeService = {
    async findAll(filters?: {
        dailyplan_id?: number;
        from?: string;
        to?: string;
    }) {
        const where: any = {};
        if (filters?.dailyplan_id !== undefined) {
            where.dailyplan_id = filters.dailyplan_id;
        }
        if (filters?.from || filters?.to) {
            where.intake_time = {};
            if (filters?.from) {
                where.intake_time.gte = new Date(filters.from);
            }
            if (filters?.to) {
                where.intake_time.lte = new Date(filters.to);
            }
        }
        return prisma.intake.findMany({ where });
    },

    async findById(id: number) {
        const intake = await prisma.intake.findUnique({
            where: { intake_id: id },
        });
        if (!intake) {
            throw new NotFoundError("Intake", id.toString());
        }
        return intake;
    },

    async create(data: unknown) {
        const validated = createIntakeSchema.parse(data);
        const dailyPlan = await prisma.dailyPlan.findUnique({
            where: { dailyplan_id: validated.dailyplan_id },
        });
        if (!dailyPlan) {
            throw new NotFoundError("DailyPlan", validated.dailyplan_id.toString());
        }
        return prisma.intake.create({
            data: validated,
        });
    },

    async update(id: number, data: unknown) {
        await this.findById(id);
        const validated = updateIntakeSchema.parse(data);
        if (validated.dailyplan_id !== undefined) {
            const dailyPlan = await prisma.dailyPlan.findUnique({
                where: { dailyplan_id: validated.dailyplan_id },
            });
            if (!dailyPlan) {
                throw new NotFoundError("DailyPlan", validated.dailyplan_id.toString());
            }
        }
        return prisma.intake.update({
            where: { intake_id: id },
            data: validated,
        });
    },

    async delete(id: number) {
        await this.findById(id);
        return prisma.intake.delete({
            where: { intake_id: id },
        });
    },
};
