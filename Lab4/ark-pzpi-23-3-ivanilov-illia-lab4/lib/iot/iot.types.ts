export interface IoTIntakeRequest {
    device_id: string;
    volume_ml: number;
    intake_time: string;
    daily_plan_id: number;
    source: "iot";
}

export interface IoTIntakeResponse {
    status: "ok" | "error";
    intake_id?: number;
    updated_plan?: {
        dailyplan_id: number;
        total_intake_ml: number;
        deviation_ml: number;
    };
    recommendations?: Array<{
        recommendation_id: number;
        recommend_type: string;
        message: string;
        severity: string;
    }>;
    error?: string;
}

export interface IoTRecommendationsRequest {
    device_id: string;
    daily_plan_id: number;
}

export interface IoTRecommendation {
    recommendation_id: number;
    recommend_type: string;
    message: string;
    severity: "low" | "medium" | "high";
    created_at?: Date;
}

export interface IoTConfigRequest {
    device_id: string;
    network_name: string;
    server_url: string;
    sync_interval_sec: number;
}

export interface IoTConfigResponse {
    status: "ok" | "error";
    config?: IoTConfigRequest;
    error?: string;
}

export interface IoTDeviceInfo {
    device_id: string;
    firmware_version: string;
    last_sync: Date | null;
    status: "online" | "offline" | "syncing" | "connected" | "connecting";
}

