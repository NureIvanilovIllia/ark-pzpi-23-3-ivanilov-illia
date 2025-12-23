import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/http/errors";
import { z } from "zod";

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

export type CreateRecommendationInput = z.infer<
    typeof createRecommendationSchema
>;
export type UpdateRecommendationInput = z.infer<
    typeof updateRecommendationSchema
>;

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
        return prisma.recommendation.delete({
            where: { recommendation_id: id },
        });
    },
};
