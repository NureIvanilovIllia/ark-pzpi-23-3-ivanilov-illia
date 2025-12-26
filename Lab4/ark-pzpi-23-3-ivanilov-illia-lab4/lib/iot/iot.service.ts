import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/http/errors";
import { dailyPlanService } from "@/lib/services/dailyPlan.service";
import { intakeService } from "@/lib/services/intake.service";
import { recommendationService } from "@/lib/services/recommendation.service";
import type {
    IoTIntakeRequest,
    IoTIntakeResponse,
    IoTRecommendationsRequest,
    IoTRecommendation,
    IoTConfigRequest,
    IoTConfigResponse,
    IoTDeviceInfo,
} from "./iot.types";

const DEVICE_CONFIGS = new Map<string, IoTConfigRequest>();

export const iotService = {
    async processIntake(data: IoTIntakeRequest): Promise<IoTIntakeResponse> {
        try {
            const plan = await dailyPlanService.findById(data.daily_plan_id);

            const intake = await intakeService.create({
                dailyplan_id: data.daily_plan_id,
                volume_ml: data.volume_ml,
                intake_time: data.intake_time,
            });

            const updatedPlan = await dailyPlanService.findById(data.daily_plan_id);

            const recommendations = await recommendationService.findAll({
                intake_id: intake.intake_id,
            });

            return {
                status: "ok",
                intake_id: intake.intake_id,
                updated_plan: {
                    dailyplan_id: updatedPlan.dailyplan_id,
                    total_intake_ml: updatedPlan.total_intake_ml || 0,
                    deviation_ml: updatedPlan.deviation_ml || 0,
                },
                recommendations: recommendations.map((rec) => ({
                    recommendation_id: rec.recommendation_id,
                    recommend_type: rec.recommend_type || "",
                    message: rec.message || "",
                    severity: (rec.severity as "low" | "medium" | "high") || "low",
                })),
            };
        } catch (error: any) {
            return {
                status: "error",
                error: error.message || "Failed to process intake",
            };
        }
    },

    async getRecommendations(
        data: IoTRecommendationsRequest
    ): Promise<IoTRecommendation[]> {
        await dailyPlanService.findById(data.daily_plan_id);

        const intakes = await prisma.intake.findMany({
            where: { dailyplan_id: data.daily_plan_id },
            orderBy: { intake_time: "desc" },
            take: 10,
        });

        if (intakes.length === 0) {
            return [];
        }

        const intakeIds = intakes.map((i) => i.intake_id);

        const recommendations = await prisma.recommendation.findMany({
            where: {
                intake_id: { in: intakeIds },
            },
            orderBy: { recommendation_id: "desc" },
            take: 20,
        });

        return recommendations.map((rec) => ({
            recommendation_id: rec.recommendation_id,
            recommend_type: rec.recommend_type || "",
            message: rec.message || "",
            severity: (rec.severity as "low" | "medium" | "high") || "low",
        }));
    },

    async saveConfig(data: IoTConfigRequest): Promise<IoTConfigResponse> {
        try {
            DEVICE_CONFIGS.set(data.device_id, data);
            return {
                status: "ok",
                config: data,
            };
        } catch (error: any) {
            return {
                status: "error",
                error: error.message || "Failed to save config",
            };
        }
    },

    async getConfig(deviceId: string): Promise<IoTConfigRequest | null> {
        return DEVICE_CONFIGS.get(deviceId) || null;
    },

    async getDeviceInfo(deviceId: string): Promise<IoTDeviceInfo> {
        const config = DEVICE_CONFIGS.get(deviceId) || null;

        const lastIntake = await prisma.intake.findFirst({
            where: {
                dailyPlan: {
                    user_id: 1,
                },
            },
            orderBy: { intake_time: "desc" },
        });

        const status: "connected" | "offline" = config ? "connected" : "offline";

        return {
            device_id: deviceId,
            firmware_version: "1.0.0",
            last_sync: lastIntake?.intake_time || null,
            status: status,
        };
    },
};

