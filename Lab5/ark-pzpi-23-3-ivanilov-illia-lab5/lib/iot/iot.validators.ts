import { z } from "zod";

export const iotIntakeRequestSchema = z.object({
    device_id: z.string().min(1),
    volume_ml: z.number().positive(),
    intake_time: z.string().datetime(),
    daily_plan_id: z.number().int().positive(),
    source: z.literal("iot"),
});

export const iotRecommendationsRequestSchema = z.object({
    device_id: z.string().min(1),
    daily_plan_id: z.number().int().positive(),
});

export const iotConfigRequestSchema = z.object({
    device_id: z.string().min(1),
    network_name: z.string().min(1),
    server_url: z.string().url(),
    sync_interval_sec: z.number().int().positive(),
});

