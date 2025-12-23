import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/http/errors";
import { z } from "zod";

const createNotificationSchema = z.object({
    recommendation_id: z.number().int(),
    notification_type: z.string().optional(),
    title: z.string().optional(),
    body: z.string().optional(),
    status: z.string().optional(),
    sent_at: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
    channel: z.string().optional(),
});

const updateNotificationSchema = z.object({
    recommendation_id: z.number().int().optional(),
    notification_type: z.string().optional(),
    title: z.string().optional(),
    body: z.string().optional(),
    status: z.string().optional(),
    sent_at: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
    channel: z.string().optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;

export const notificationService = {
    async findAll(filters?: {
        recommendation_id?: number;
        status?: string;
        channel?: string;
    }) {
        const where: any = {};
        if (filters?.recommendation_id !== undefined) {
            where.recommendation_id = filters.recommendation_id;
        }
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.channel) {
            where.channel = filters.channel;
        }
        return prisma.notification.findMany({ where });
    },

    async findById(id: number) {
        const notification = await prisma.notification.findUnique({
            where: { notification_id: id },
        });
        if (!notification) {
            throw new NotFoundError("Notification", id.toString());
        }
        return notification;
    },

    async create(data: unknown) {
        const validated = createNotificationSchema.parse(data);
        const recommendation = await prisma.recommendation.findUnique({
            where: { recommendation_id: validated.recommendation_id },
        });
        if (!recommendation) {
            throw new NotFoundError(
                "Recommendation",
                validated.recommendation_id.toString()
            );
        }
        return prisma.notification.create({
            data: validated,
        });
    },

    async update(id: number, data: unknown) {
        await this.findById(id);
        const validated = updateNotificationSchema.parse(data);
        if (validated.recommendation_id !== undefined) {
            const recommendation = await prisma.recommendation.findUnique({
                where: { recommendation_id: validated.recommendation_id },
            });
            if (!recommendation) {
                throw new NotFoundError(
                    "Recommendation",
                    validated.recommendation_id.toString()
                );
            }
        }
        return prisma.notification.update({
            where: { notification_id: id },
            data: validated,
        });
    },

    async delete(id: number) {
        await this.findById(id);
        return prisma.notification.delete({
            where: { notification_id: id },
        });
    },
};
