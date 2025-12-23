import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError } from "@/lib/http/errors";
import { z } from "zod";

const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    role: z.string().optional(),
    status: z.string().optional(),
});

const updateUserSchema = z.object({
    email: z.string().email().optional(),
    password: z.string().min(1).optional(),
    role: z.string().optional(),
    status: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userService = {
    async findAll(filters?: {
        email?: string;
        role?: string;
        status?: string;
    }) {
        const where: any = {};
        if (filters?.email) {
            where.email = { contains: filters.email, mode: "insensitive" };
        }
        if (filters?.role) {
            where.role = filters.role;
        }
        if (filters?.status) {
            where.status = filters.status;
        }
        return prisma.user.findMany({ where });
    },

    async findById(id: number) {
        const user = await prisma.user.findUnique({
            where: { user_id: id },
        });
        if (!user) {
            throw new NotFoundError("User", id.toString());
        }
        return user;
    },

    async create(data: unknown) {
        const validated = createUserSchema.parse(data);

        const existing = await prisma.user.findUnique({
            where: { email: validated.email },
        });
        if (existing) {
            throw new ConflictError("User with this email already exists");
        }

        return prisma.user.create({
            data: validated,
        });
    },

    async update(id: number, data: unknown) {
        await this.findById(id);
        const validated = updateUserSchema.parse(data);
        if (validated.email) {
            const existing = await prisma.user.findUnique({
                where: { email: validated.email },
            });
            if (existing && existing.user_id !== id) {
                throw new ConflictError("User with this email already exists");
            }
        }
        return prisma.user.update({
            where: { user_id: id },
            data: validated,
        });
    },

    async delete(id: number) {
        await this.findById(id);
        await prisma.user.delete({
            where: { user_id: id },
        });
        
        const maxId = await prisma.user.aggregate({
            _max: { user_id: true },
        });
        const nextId = maxId._max.user_id ? maxId._max.user_id + 1 : 1;
        await prisma.$executeRawUnsafe(
            `ALTER SEQUENCE users_user_id_seq RESTART WITH ${nextId};`
        );
    },
};
