"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import {
    configureConnectionInfo,
    configureBottleSettings,
    configureConsoleSettings,
    configureButtonSettings,
    configureActivityTypes,
    configureActivityIcon,
} from "@/lib/iot/settings";
import {
    iotClientService,
    calculateWaterBonus,
    calculateActivityDuration,
    calculateWaterLevel,
    calculateNextVolume,
    type Recommendation,
    type IntakeResponse,
} from "@/lib/iot/iot.client.service";

export default function IoTClientPage() {
    const [activeTab, setActiveTab] = useState<"main" | "connection">("main");
    const [deviceId, setDeviceId] = useState<string>(
        configureConnectionInfo().deviceId
    );
    const [dailyPlanId, setDailyPlanId] = useState("");
    const [isFilling, setIsFilling] = useState(false);
    const [currentVolume, setCurrentVolume] = useState(0);
    const [lastSentVolume, setLastSentVolume] = useState(0);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<IntakeResponse | null>(null);
    const [lastIntakeRecommendations, setLastIntakeRecommendations] = useState<
        Recommendation[]
    >([]);
    const [lastActivity, setLastActivity] = useState<{
        type: string;
        durationMin: number;
        waterBonusMl: number;
    } | null>(null);
    const [activeActivities, setActiveActivities] = useState<
        Map<string, number>
    >(new Map());
    const [activityTimes, setActivityTimes] = useState<Map<string, number>>(
        new Map()
    );
    const fillIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const activeActivitiesRef = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        if (deviceId && dailyPlanId) {
            loadRecommendations();
        }
    }, [deviceId, dailyPlanId]);

    useEffect(() => {
        return () => {
            if (fillIntervalRef.current) {
                clearInterval(fillIntervalRef.current);
            }
            if (activityIntervalRef.current) {
                clearInterval(activityIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        activeActivitiesRef.current = activeActivities;
    }, [activeActivities]);

    useEffect(() => {
        if (activeActivities.size > 0) {
            activityIntervalRef.current = setInterval(() => {
                setActivityTimes((prev) => {
                    const newTimes = new Map(prev);
                    activeActivitiesRef.current.forEach((startTime, activityType) => {
                        const durationMin = calculateActivityDuration(startTime);
                        newTimes.set(activityType, Math.floor(durationMin));
                    });
                    return newTimes;
                });
            }, 100);
        } else {
            if (activityIntervalRef.current) {
                clearInterval(activityIntervalRef.current);
                activityIntervalRef.current = null;
            }
        }

        return () => {
            if (activityIntervalRef.current) {
                clearInterval(activityIntervalRef.current);
            }
        };
    }, [activeActivities.size]);

    const loadRecommendations = async () => {
        if (!deviceId || !dailyPlanId) return;
        const recommendations = await iotClientService.getRecommendations(
            deviceId,
            parseInt(dailyPlanId, 10)
        );
        if (recommendations.length > 0) {
            setLastIntakeRecommendations(recommendations);
        }
    };

    const loadLastIntakeRecommendations = async () => {
        if (!dailyPlanId) return;
        const recommendations = await iotClientService.getLastIntakeRecommendations(
            parseInt(dailyPlanId, 10)
        );
        setLastIntakeRecommendations(recommendations);
    };

    const handleButtonDown = () => {
        if (!dailyPlanId) {
            alert("Please enter Daily Plan ID first");
            return;
        }

        setIsFilling(true);
        setCurrentVolume(0);

        const bottleSettings = configureBottleSettings();
        fillIntervalRef.current = setInterval(() => {
            setCurrentVolume((prev) => {
                return calculateNextVolume(prev);
            });
        }, bottleSettings.FILL_INTERVAL_MS);
    };

    const handleButtonUp = async () => {
        setIsFilling(false);

        if (fillIntervalRef.current) {
            clearInterval(fillIntervalRef.current);
            fillIntervalRef.current = null;
        }

        if (currentVolume > 0) {
            await sendIntakeData(currentVolume);
        }
    };

    const sendIntakeData = async (volume: number) => {
        setLoading(true);
        setResponse(null);

        const result = await iotClientService.sendIntake(
            deviceId,
            parseInt(dailyPlanId, 10),
            volume
        );

        setResponse(result);

        if (result.status === "ok") {
            setLastSentVolume(Math.round(volume));
            if (result.recommendations && result.recommendations.length > 0) {
                setLastIntakeRecommendations(result.recommendations);
            } else {
                setLastIntakeRecommendations([]);
                await loadRecommendations();
            }
            setCurrentVolume(0);
        }

        setLoading(false);
    };

    const handleActivityClick = async (activityType: string) => {
        if (!dailyPlanId) {
            alert("Please enter Daily Plan ID first");
            return;
        }

        const isActive = activeActivities.has(activityType);

        if (!isActive) {
            setActiveActivities((prev) => {
                const newMap = new Map(prev);
                newMap.set(activityType, Date.now());
                return newMap;
            });
            setActivityTimes((prev) => {
                const newMap = new Map(prev);
                newMap.set(activityType, 0);
                return newMap;
            });
        } else {
            const startTime = activeActivities.get(activityType)!;
            const durationMin = calculateActivityDuration(startTime);

            setActiveActivities((prev) => {
                const newMap = new Map(prev);
                newMap.delete(activityType);
                return newMap;
            });
            setActivityTimes((prev) => {
                const newMap = new Map(prev);
                newMap.delete(activityType);
                return newMap;
            });

            await sendActivityData(activityType, startTime, durationMin);
        }
    };

    const sendActivityData = async (
        activityType: string,
        startTime: number,
        durationMin: number
    ) => {
        const activity = await iotClientService.sendActivity(
            parseInt(dailyPlanId, 10),
            activityType,
            startTime,
            durationMin
        );

        if (activity) {
            setLastActivity({
                type: activityType,
                durationMin: Math.round(durationMin),
                waterBonusMl: activity.water_bonus_ml,
            });

            setTimeout(async () => {
                await loadLastIntakeRecommendations();
            }, 500);
        }
    };

    const waterLevel = calculateWaterLevel(currentVolume);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>IoT Device Emulator</h1>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${
                        activeTab === "main" ? styles.tabActive : ""
                    }`}
                    onClick={() => setActiveTab("main")}>
                    Main
                </button>
                <button
                    className={`${styles.tab} ${
                        activeTab === "connection" ? styles.tabActive : ""
                    }`}
                    onClick={() => setActiveTab("connection")}>
                    Connection Info
                </button>
            </div>

            {activeTab === "connection" && (
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>
                        Device Connection Information
                    </h2>
                    <div className={styles.formField}>
                        <label className={styles.label}>Device ID:</label>
                        <input
                            type="text"
                            value={configureConnectionInfo().deviceId}
                            className={styles.input}
                            readOnly
                            disabled
                        />
                    </div>
                    <div className={styles.formField}>
                        <label className={styles.label}>WiFi IP Address:</label>
                        <input
                            type="text"
                            value={configureConnectionInfo().wifiIp}
                            className={styles.input}
                            readOnly
                            disabled
                        />
                    </div>
                    <div className={styles.formField}>
                        <label className={styles.label}>Server URL:</label>
                        <input
                            type="url"
                            value={configureConnectionInfo().serverUrl}
                            className={styles.input}
                            readOnly
                            disabled
                        />
                    </div>
                    <div className={styles.formFieldLast}>
                        <label className={styles.label}>Status:</label>
                        <input
                            type="text"
                            value={configureConnectionInfo().status}
                            className={styles.input}
                            readOnly
                            disabled
                        />
                    </div>
                </div>
            )}

            {activeTab === "main" && (
                <>
                    <div className={styles.deviceContainer}>
                        <div className={styles.settingsCard}>
                            <h3 className={styles.settingsTitle}>
                                Device Settings
                            </h3>
                            <div className={styles.formField}>
                                <label className={styles.label}>
                                    Device ID:
                                </label>
                                <input
                                    type="text"
                                    value={deviceId}
                                    onChange={(e) =>
                                        setDeviceId(e.target.value)
                                    }
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div className={styles.formFieldLast}>
                                <label className={styles.label}>
                                    Daily Plan ID:
                                </label>
                                <input
                                    type="number"
                                    value={dailyPlanId}
                                    onChange={(e) =>
                                        setDailyPlanId(e.target.value)
                                    }
                                    className={styles.input}
                                    required
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className={styles.bottleContainer}>
                            <div className={styles.bottle}>
                                <div className={styles.bottleCap}></div>
                                <div className={styles.bottleBody}>
                                    <div
                                        className={styles.water}
                                        style={{ height: `${waterLevel}%` }}>
                                        <div className={styles.waterWave}></div>
                                    </div>
                                    <div className={styles.bottleLabel}>
                                        <span className={styles.volumeText}>
                                            {Math.round(currentVolume)} ml
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.wire}></div>
                            </div>

                            <button
                                className={`${styles.fillButton} ${
                                    isFilling ? styles.fillButtonActive : ""
                                }`}
                                onMouseDown={handleButtonDown}
                                onMouseUp={handleButtonUp}
                                onMouseLeave={handleButtonUp}
                                onTouchStart={handleButtonDown}
                                onTouchEnd={handleButtonUp}
                                disabled={loading || !dailyPlanId}>
                                {isFilling
                                    ? configureButtonSettings().TEXT_FILLING
                                    : configureButtonSettings().TEXT_IDLE}
                            </button>

                            <div className={styles.displayCard}>
                                <div className={styles.consoleDisplay}>
                                    <div className={styles.consoleHeader}>
                                        <span className={styles.consolePrompt}>
                                            IoT Device Console{" "}
                                            {configureConsoleSettings().VERSION}
                                        </span>
                                    </div>
                                    <div className={styles.consoleContent}>
                                        <div className={styles.consoleLine}>
                                            <span
                                                className={
                                                    styles.consolePrompt
                                                }>
                                                $
                                            </span>
                                            <span
                                                className={styles.consoleText}>
                                                {" "}
                                                Last intake volume:
                                            </span>
                                        </div>
                                        <div className={styles.consoleLine}>
                                            <span
                                                className={styles.consoleValue}>
                                                {lastSentVolume > 0
                                                    ? `${lastSentVolume} ml`
                                                    : "---"}
                                            </span>
                                        </div>

                                        {response &&
                                            response.status === "ok" && (
                                                <>
                                                    <div
                                                        className={
                                                            styles.consoleLine
                                                        }>
                                                        <span
                                                            className={
                                                                styles.consolePrompt
                                                            }>
                                                            $
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.consoleText
                                                            }>
                                                            {" "}
                                                            Status:
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.consoleLine
                                                        }>
                                                        <span
                                                            className={
                                                                styles.consoleSuccess
                                                            }>
                                                            [OK] Data sent
                                                            successfully
                                                        </span>
                                                    </div>
                                                </>
                                            )}

                                        {response &&
                                            response.status === "error" && (
                                                <>
                                                    <div
                                                        className={
                                                            styles.consoleLine
                                                        }>
                                                        <span
                                                            className={
                                                                styles.consolePrompt
                                                            }>
                                                            $
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.consoleText
                                                            }>
                                                            {" "}
                                                            Status:
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.consoleLine
                                                        }>
                                                        <span
                                                            className={
                                                                styles.consoleError
                                                            }>
                                                            [ERROR]{" "}
                                                            {response.error ||
                                                                "Failed to send"}
                                                        </span>
                                                    </div>
                                                </>
                                            )}

                                        {lastIntakeRecommendations.length >
                                            0 && (
                                            <>
                                                <div
                                                    className={
                                                        styles.consoleLine
                                                    }>
                                                    <span
                                                        className={
                                                            styles.consolePrompt
                                                        }>
                                                        $
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.consoleText
                                                        }>
                                                        {" "}
                                                        Recommendations:
                                                    </span>
                                                </div>
                                                {lastIntakeRecommendations.map(
                                                    (rec) => (
                                                        <div
                                                            key={
                                                                rec.recommendation_id
                                                            }
                                                            className={
                                                                styles.consoleLine
                                                            }>
                                                            <span
                                                                className={
                                                                    styles.consoleRecommendation
                                                                }>
                                                                [
                                                                {rec.severity.toUpperCase()}
                                                                ]{" "}
                                                                {
                                                                    rec.recommend_type
                                                                }
                                                                : {rec.message}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </>
                                        )}

                                        {lastSentVolume > 0 &&
                                            lastIntakeRecommendations.length ===
                                                0 && (
                                                <>
                                                    <div
                                                        className={
                                                            styles.consoleLine
                                                        }>
                                                        <span
                                                            className={
                                                                styles.consolePrompt
                                                            }>
                                                            $
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.consoleText
                                                            }>
                                                            {" "}
                                                            Recommendations:
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.consoleLine
                                                        }>
                                                        <span
                                                            className={
                                                                styles.consoleText
                                                            }>
                                                            {" "}
                                                            No recommendations
                                                        </span>
                                                    </div>
                                                </>
                                            )}

                                        {lastActivity && (
                                            <>
                                                <div
                                                    className={
                                                        styles.consoleLine
                                                    }>
                                                    <span
                                                        className={
                                                            styles.consolePrompt
                                                        }>
                                                        $
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.consoleText
                                                        }>
                                                        {" "}
                                                        Activity completed:
                                                    </span>
                                                </div>
                                                <div
                                                    className={
                                                        styles.consoleLine
                                                    }>
                                                    <span
                                                        className={
                                                            styles.consoleText
                                                        }>
                                                        {" "}
                                                        Type: {lastActivity.type}
                                                    </span>
                                                </div>
                                                <div
                                                    className={
                                                        styles.consoleLine
                                                    }>
                                                    <span
                                                        className={
                                                            styles.consoleText
                                                        }>
                                                        {" "}
                                                        Duration:{" "}
                                                        {lastActivity.durationMin}{" "}
                                                        min
                                                    </span>
                                                </div>
                                                <div
                                                    className={
                                                        styles.consoleLine
                                                    }>
                                                    <span
                                                        className={
                                                            styles.consoleText
                                                        }>
                                                        {" "}
                                                        Water bonus: +{" "}
                                                        {lastActivity.waterBonusMl}{" "}
                                                        ml
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        <div className={styles.consoleLine}>
                                            <span
                                                className={
                                                    styles.consolePrompt
                                                }>
                                                $
                                            </span>
                                            <span
                                                className={
                                                    styles.consoleCursor
                                                }>
                                                _
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.activitiesCard}>
                            <h3 className={styles.activitiesTitle}>Activities</h3>
                            <div className={styles.activitiesGrid}>
                                {configureActivityTypes().map((activity) => {
                                    const isActive = activeActivities.has(
                                        activity.type
                                    );
                                    const timeMinutes = activityTimes.get(
                                        activity.type
                                    ) || 0;

                                    return (
                                        <button
                                            key={activity.type}
                                            className={`${styles.activityButton} ${
                                                isActive
                                                    ? styles.activityButtonActive
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleActivityClick(
                                                    activity.type
                                                )
                                            }
                                            disabled={loading || !dailyPlanId}>
                                            <span className={styles.activityIcon}>
                                                {configureActivityIcon(
                                                    activity.type
                                                ) &&
                                                    configureActivityIcon(
                                                        activity.type
                                                    )({})}
                                            </span>
                                            <span className={styles.activityLabel}>
                                                {activity.label}
                                            </span>
                                            {isActive && (
                                                <span
                                                    className={
                                                        styles.activityTime
                                                    }>
                                                    {timeMinutes} min
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
