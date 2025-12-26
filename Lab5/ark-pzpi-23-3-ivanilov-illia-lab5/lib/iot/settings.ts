import {
    BsPerson,
    BsBicycle,
    BsDroplet,
    BsPersonWalking,
    BsLightning,
    BsFlower1,
} from "react-icons/bs";

export const configureConnectionInfo = () => ({
    deviceId: "iot-device-001",
    wifiIp: "192.168.1.100",
    serverUrl: "https://api.iot.com",
    status: "connected" as const,
});

export const configureBottleSettings = () => ({
    MAX_CAPACITY_ML: 1000,
    FILL_STEP_ML: 5,
    FILL_INTERVAL_MS: 50,
});

export const configureConsoleSettings = () => ({
    VERSION: "v1.0",
    MIN_HEIGHT: 300,
});

export const configureButtonSettings = () => ({
    SIZE: 120,
    TEXT_IDLE: "Hold to Fill",
    TEXT_FILLING: "Filling...",
});

export const configureApiSettings = () => {
    const BASE_PATH = "/api";
    const IOT_PATH = `${BASE_PATH}/iot`;

    return {
        SOURCE: "iot" as const,
        INTAKE_ENDPOINT: `${IOT_PATH}/intake`,
        RECOMMENDATIONS_ENDPOINT: `${IOT_PATH}/recommendations`,
        ACTIVITIES_ENDPOINT: `${BASE_PATH}/activities`,
    };
};

export const configureActivitySettings = () => ({
    TIME_ACCELERATION: 10,
    DEFAULT_INTENSITY: "medium" as const,
});

const getActivityTypesConfig = () => {
    const types = [
        { type: "running", label: "Running" },
        { type: "cycling", label: "Cycling" },
        { type: "swimming", label: "Swimming" },
        { type: "walking", label: "Walking" },
        { type: "gym", label: "Gym" },
        { type: "yoga", label: "Yoga" },
    ];

    const iconMap: Record<string, any> = {
        running: BsPerson,
        cycling: BsBicycle,
        swimming: BsDroplet,
        walking: BsPersonWalking,
        gym: BsLightning,
        yoga: BsFlower1,
    };

    return { types, iconMap };
};

export const configureActivityTypes = () => {
    return getActivityTypesConfig().types;
};

export const configureActivityIcon = (type: string) => {
    return getActivityTypesConfig().iconMap[type] || null;
};
