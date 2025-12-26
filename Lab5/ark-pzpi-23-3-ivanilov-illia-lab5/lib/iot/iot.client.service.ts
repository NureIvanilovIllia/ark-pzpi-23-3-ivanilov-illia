import {
    configureApiSettings,
    configureActivitySettings,
    configureBottleSettings,
} from "./settings";

export interface Recommendation {
    recommendation_id: number;
    recommend_type: string;
    message: string;
    severity: string;
}

export interface IntakeResponse {
    status: "ok" | "error";
    intake_id?: number;
    updated_plan?: {
        dailyplan_id: number;
        total_intake_ml: number;
        deviation_ml: number;
    };
    recommendations?: Recommendation[];
    error?: string;
}

export interface ActivityResponse {
    activity_id: number;
    dailyplan_id: number;
    activity_type: string;
    intensity: string;
    start_time: Date;
    end_time: Date;
    duration_min: number;
    water_bonus_ml: number;
}

const getIntensityFactor = (intensity: string): number => {
    if (intensity === "low") return 4;
    if (intensity === "medium") return 7;
    return 10;
};

export const calculateWaterBonus = (durationMin: number, intensity: string): number => {
    return Math.round(durationMin) * getIntensityFactor(intensity);
};

export const calculateActivityDuration = (startTime: number): number => {
    const activitySettings = configureActivitySettings();
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    return elapsedSeconds * activitySettings.TIME_ACCELERATION;
};

export const calculateWaterLevel = (currentVolume: number): number => {
    const bottleSettings = configureBottleSettings();
    return Math.min((currentVolume / bottleSettings.MAX_CAPACITY_ML) * 100, 100);
};

export const calculateNextVolume = (currentVolume: number): number => {
    const bottleSettings = configureBottleSettings();
    const newVolume = currentVolume + bottleSettings.FILL_STEP_ML;
    return newVolume > bottleSettings.MAX_CAPACITY_ML
        ? bottleSettings.MAX_CAPACITY_ML
        : newVolume;
};

export const iotClientService = {
    async sendIntake(
        deviceId: string,
        dailyPlanId: number,
        volume: number
    ): Promise<IntakeResponse> {
        try {
            const apiSettings = configureApiSettings();
            const res = await fetch(apiSettings.INTAKE_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    device_id: deviceId,
                    volume_ml: Math.round(volume),
                    intake_time: new Date().toISOString(),
                    daily_plan_id: dailyPlanId,
                    source: apiSettings.SOURCE,
                }),
            });

            const data = await res.json();

            if (data.ok) {
                return {
                    status: "ok",
                    ...data.data,
                };
            } else {
                return {
                    status: "error",
                    error: data.error?.message || "Unknown error",
                };
            }
        } catch (error: any) {
            return {
                status: "error",
                error: error.message || "Failed to send data",
            };
        }
    },

    async sendActivity(
        dailyPlanId: number,
        activityType: string,
        startTime: number,
        durationMin: number
    ): Promise<ActivityResponse | null> {
        try {
            const activitySettings = configureActivitySettings();
            const apiSettings = configureApiSettings();
            const intensity = activitySettings.DEFAULT_INTENSITY;
            const res = await fetch(apiSettings.ACTIVITIES_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    dailyplan_id: dailyPlanId,
                    activity_type: activityType,
                    intensity: intensity,
                    start_time: new Date(startTime).toISOString(),
                    end_time: new Date().toISOString(),
                    duration_min: Math.round(durationMin),
                }),
            });

            const data = await res.json();

            if (data.ok) {
                return data.data;
            }
            return null;
        } catch (error) {
            return null;
        }
    },

    async getRecommendations(
        deviceId: string,
        dailyPlanId: number
    ): Promise<Recommendation[]> {
        try {
            const apiSettings = configureApiSettings();
            const res = await fetch(
                `${apiSettings.RECOMMENDATIONS_ENDPOINT}?device_id=${deviceId}&daily_plan_id=${dailyPlanId}`
            );
            const data = await res.json();

            if (data.ok) {
                return data.data || [];
            }
            return [];
        } catch (error) {
            return [];
        }
    },

    async getLastIntakeRecommendations(
        dailyPlanId: number
    ): Promise<Recommendation[]> {
        try {
            const intakesRes = await fetch(
                `/api/intakes?dailyplan_id=${dailyPlanId}`
            );
            const intakesData = await intakesRes.json();

            if (intakesData.ok && intakesData.data && intakesData.data.length > 0) {
                const sortedIntakes = [...intakesData.data].sort((a, b) => {
                    const timeA = a.intake_time
                        ? new Date(a.intake_time).getTime()
                        : 0;
                    const timeB = b.intake_time
                        ? new Date(b.intake_time).getTime()
                        : 0;
                    return timeB - timeA;
                });
                const lastIntake = sortedIntakes[0];

                const recommendationsRes = await fetch(
                    `/api/recommendations?intake_id=${lastIntake.intake_id}`
                );
                const recommendationsData = await recommendationsRes.json();

                if (recommendationsData.ok) {
                    return recommendationsData.data || [];
                }
            }
            return [];
        } catch (error) {
            return [];
        }
    },
};

