import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/http/errors";
import { z } from "zod";
import { dailyPlanService } from "./dailyPlan.service";
import { recommendationService } from "./recommendation.service";

const createIntakeSchema = z.object({
    dailyplan_id: z.number().int(),
    volume_ml: z.number().optional(),
    intake_time: z.iso
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
});

const updateIntakeSchema = z.object({
    dailyplan_id: z.number().int().optional(),
    volume_ml: z.number().optional(),
    intake_time: z.iso
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
            throw new NotFoundError(
                "DailyPlan",
                validated.dailyplan_id.toString()
            );
        }

        const intake = await prisma.intake.create({
            data: {
                dailyplan_id: validated.dailyplan_id,
                volume_ml: validated.volume_ml || 0,
                intake_time: validated.intake_time || new Date(),
            },
        });

        await dailyPlanService.recalculateFromIntakes(validated.dailyplan_id);
        await recommendationService.createRecommendationsForIntake(intake.intake_id);

        return intake;
    },

    async update(id: number, data: unknown) {
        const existingIntake = await this.findById(id);
        const validated = updateIntakeSchema.parse(data);
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

        const updatedIntake = await prisma.intake.update({
            where: { intake_id: id },
            data: validated,
        });

        await dailyPlanService.recalculateFromIntakes(
            existingIntake.dailyplan_id
        );
        if (
            validated.dailyplan_id !== undefined &&
            validated.dailyplan_id !== existingIntake.dailyplan_id
        ) {
            await dailyPlanService.recalculateFromIntakes(
                validated.dailyplan_id
            );
        }

        return updatedIntake;
    },

    async delete(id: number) {
        const intake = await this.findById(id);
        const dailyplanId = intake.dailyplan_id;

        await prisma.intake.delete({
            where: { intake_id: id },
        });

        await dailyPlanService.recalculateFromIntakes(dailyplanId);
    },
};
