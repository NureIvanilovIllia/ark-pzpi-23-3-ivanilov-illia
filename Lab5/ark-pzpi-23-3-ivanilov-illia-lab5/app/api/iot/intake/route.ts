import { NextRequest } from "next/server";
import { iotService } from "@/lib/iot/iot.service";
import { iotIntakeRequestSchema } from "@/lib/iot/iot.validators";
import { successResponse } from "@/lib/http/responses";
import { handleError } from "@/lib/http/errors";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = iotIntakeRequestSchema.parse(body);

        const result = await iotService.processIntake(validated);

        if (result.status === "error") {
            return handleError(new Error(result.error || "Failed to process intake"));
        }

        return successResponse(result);
    } catch (error) {
        return handleError(error);
    }
}

