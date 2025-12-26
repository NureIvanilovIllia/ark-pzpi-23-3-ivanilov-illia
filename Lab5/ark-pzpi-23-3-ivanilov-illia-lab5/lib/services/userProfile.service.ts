import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/http/errors";
import { z } from "zod";
import { dailyPlanService } from "./dailyPlan.service";

const createUserProfileSchema = z.object({
    user_id: z.number().int(),
    weight: z.number().min(20).max(300).optional(),
    activity_level: z.enum(["low", "medium", "high"]).optional(),
    goal_type: z.enum(["lose_weight", "maintain", "gain_muscle"]).optional(),
    date_of_birth: z.iso
        .date()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
});

const updateUserProfileSchema = z.object({
    user_id: z.number().int().optional(),
    weight: z.number().min(20).max(300).optional(),
    activity_level: z.enum(["low", "medium", "high"]).optional(),
    goal_type: z.enum(["lose_weight", "maintain", "gain_muscle"]).optional(),
    date_of_birth: z.iso
        .date()
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

        const profile = await prisma.userProfile.create({
            data: {
                user_id: validated.user_id,
                weight: validated.weight,
                activity_level: validated.activity_level,
                goal_type: validated.goal_type,
                date_of_birth: validated.date_of_birth,
            },
        });

        await dailyPlanService.findOrCreateToday(validated.user_id, {
            weight: validated.weight,
            activity_level: validated.activity_level,
            goal_type: validated.goal_type,
        });

        return profile;
    },

    async update(id: number, data: unknown) {
        const existingProfile = await this.findById(id);
        const validated = updateUserProfileSchema.parse(data);

        if (validated.user_id !== undefined) {
            const user = await prisma.user.findUnique({
                where: { user_id: validated.user_id },
            });
            if (!user) {
                throw new NotFoundError("User", validated.user_id.toString());
            }
        }

        const updatedProfile = await prisma.userProfile.update({
            where: { profile_id: id },
            data: validated,
        });

        if (
            validated.weight !== undefined ||
            validated.activity_level !== undefined ||
            validated.goal_type !== undefined
        ) {
            await dailyPlanService.findOrCreateToday(existingProfile.user_id, {
                weight: updatedProfile.weight,
                activity_level: updatedProfile.activity_level,
                goal_type: updatedProfile.goal_type,
            });
        }

        return updatedProfile;
    },

    async delete(id: number) {
        await this.findById(id);
        await prisma.userProfile.delete({
            where: { profile_id: id },
        });
    },
};
