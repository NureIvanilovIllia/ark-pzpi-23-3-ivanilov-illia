import { NextRequest } from "next/server";
import { iotService } from "@/lib/iot/iot.service";
import { iotRecommendationsRequestSchema } from "@/lib/iot/iot.validators";
import { successResponse } from "@/lib/http/responses";
import { handleError } from "@/lib/http/errors";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const deviceId = searchParams.get("device_id");
        const dailyPlanId = searchParams.get("daily_plan_id");

        if (!deviceId || !dailyPlanId) {
            return handleError(
                new Error("device_id and daily_plan_id are required")
            );
        }

        const validated = iotRecommendationsRequestSchema.parse({
            device_id: deviceId,
            daily_plan_id: parseInt(dailyPlanId, 10),
        });

        const recommendations = await iotService.getRecommendations(validated);

        return successResponse(recommendations);
    } catch (error) {
        return handleError(error);
    }
}

