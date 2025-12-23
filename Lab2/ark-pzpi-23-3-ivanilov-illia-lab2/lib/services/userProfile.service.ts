import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/http/errors";
import { z } from "zod";

const createUserProfileSchema = z.object({
    user_id: z.number().int(),
    weight: z.number().optional(),
    activity_level: z.string().optional(),
    goal_type: z.string().optional(),
    wake_time: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
    date_of_birth: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
});

const updateUserProfileSchema = z.object({
    user_id: z.number().int().optional(),
    weight: z.number().optional(),
    activity_level: z.string().optional(),
    goal_type: z.string().optional(),
    wake_time: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
    date_of_birth: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
});

export type CreateUserProfileInput = z.infer<typeof createUserProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

export const userProfileService = {
    async findAll(filters?: { user_id?: number }) {
        const where: any = {};
        if (filters?.user_id !== undefined) {
            where.user_id = filters.user_id;
        }
        return prisma.userProfile.findMany({ where });
    },

    async findById(id: number) {
        const profile = await prisma.userProfile.findUnique({
            where: { profile_id: id },
        });
        if (!profile) {
            throw new NotFoundError("UserProfile", id.toString());
        }
        return profile;
    },

    async create(data: unknown) {
        const validated = createUserProfileSchema.parse(data);
        const user = await prisma.user.findUnique({
            where: { user_id: validated.user_id },
        });
        if (!user) {
            throw new NotFoundError("User", validated.user_id.toString());
        }
        return prisma.userProfile.create({
            data: {
                user_id: validated.user_id,
                weight: validated.weight,
                activity_level: validated.activity_level,
                goal_type: validated.goal_type,
                wake_time: validated.wake_time,
                date_of_birth: validated.date_of_birth,
            },
        });
    },

    async update(id: number, data: unknown) {
        await this.findById(id);
        const validated = updateUserProfileSchema.parse(data);
        if (validated.user_id !== undefined) {
            const user = await prisma.user.findUnique({
                where: { user_id: validated.user_id },
            });
            if (!user) {
                throw new NotFoundError("User", validated.user_id.toString());
            }
        }
        return prisma.userProfile.update({
            where: { profile_id: id },
            data: validated,
        });
    },

    async delete(id: number) {
        await this.findById(id);
        return prisma.userProfile.delete({
            where: { profile_id: id },
        });
    },
};
