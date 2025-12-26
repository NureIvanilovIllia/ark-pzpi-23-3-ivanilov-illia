import { NextRequest } from "next/server";
import { iotService } from "@/lib/iot/iot.service";
import { successResponse } from "@/lib/http/responses";
import { handleError, ValidationError } from "@/lib/http/errors";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const deviceId = searchParams.get("device_id");

        if (!deviceId || deviceId.trim() === "") {
            return handleError(new ValidationError("device_id is required"));
        }

        const deviceInfo = await iotService.getDeviceInfo(deviceId);

        return successResponse(deviceInfo);
    } catch (error) {
        return handleError(error);
    }
}

