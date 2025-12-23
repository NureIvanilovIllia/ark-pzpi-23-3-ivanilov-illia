import { NextResponse } from "next/server";
import { paths } from "@/lib/openapi/paths";
import { schemas } from "@/lib/openapi/schemas";

export const runtime = "nodejs";

export async function GET() {
    const spec = {
        openapi: "3.0.3",
        info: {
            title: "Water Tracker API",
            version: "1.0.0",
            description: "API документація для Next.js + Prisma + PostgreSQL",
        },
        servers: [{ url: "http://localhost:3000" }],
        tags: [
            { name: "Users", description: "Операції з користувачами" },
            { name: "User Profiles", description: "Операції з профілями користувачів" },
            { name: "Daily Plans", description: "Операції з щоденними планами" },
            { name: "Activities", description: "Операції з активностями" },
            { name: "Intakes", description: "Операції з прийомами води" },
            { name: "Recommendations", description: "Операції з рекомендаціями" },
            { name: "Notifications", description: "Операції з сповіщеннями" },
        ],
        paths,
        components: {
            schemas,
        },
    };

    return NextResponse.json(spec);
}
