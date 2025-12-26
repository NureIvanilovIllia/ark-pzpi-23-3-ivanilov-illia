import { NextRequest } from "next/server";
import { statisticsService } from "@/lib/services/statistics.service";
import { successResponse } from "@/lib/http/responses";
import { handleError } from "@/lib/http/errors";
import { parseQueryInt } from "@/lib/http/params";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const filters = {
            user_id: parseQueryInt(searchParams.get("user_id"), "user_id"),
            from_date: searchParams.get("from_date") || undefined,
            to_date: searchParams.get("to_date") || undefined,
        };

        const stats = await statisticsService.getActivityStats(filters);
        return successResponse(stats);
    } catch (error) {
        return handleError(error);
    }
}

