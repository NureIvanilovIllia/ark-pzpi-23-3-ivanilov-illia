export const schemas = {
    ApiError: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: false },
            error: {
                type: "object",
                properties: {
                    code: { type: "string" },
                    message: { type: "string" },
                    details: {},
                },
                required: ["code", "message"],
            },
        },
        required: ["ok", "error"],
    },

    User: {
        type: "object",
        properties: {
            user_id: { type: "integer" },
            email: { type: "string" },
            password: { type: "string" },
            role: { type: "string" },
            status: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
        },
        required: ["user_id", "email", "password"],
    },

    UserCreate: {
        type: "object",
        properties: {
            email: { type: "string" },
            password: { type: "string" },
            role: { type: "string" },
            status: { type: "string" },
        },
        required: ["email", "password"],
    },

    UserPatch: {
        type: "object",
        properties: {
            email: { type: "string" },
            password: { type: "string" },
            role: { type: "string" },
            status: { type: "string" },
        },
    },

    OkUser: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/User" },
        },
        required: ["ok", "data"],
    },

    OkUsersList: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: {
                type: "array",
                items: { $ref: "#/components/schemas/User" },
            },
        },
        required: ["ok", "data"],
    },

    UserProfile: {
        type: "object",
        properties: {
            profile_id: { type: "integer" },
            user_id: { type: "integer" },
            weight: { type: "number" },
            activity_level: { type: "string" },
            goal_type: { type: "string" },
            wake_time: { type: "string", format: "date-time" },
            date_of_birth: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
        },
    },

    UserProfileCreate: {
        type: "object",
        properties: {
            user_id: { type: "integer" },
            weight: { type: "number" },
            activity_level: { type: "string" },
            goal_type: { type: "string" },
            wake_time: { type: "string", format: "date-time" },
            date_of_birth: { type: "string", format: "date-time" },
        },
        required: ["user_id"],
    },

    OkUserProfile: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/UserProfile" },
        },
        required: ["ok", "data"],
    },

    OkUserProfilesList: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: {
                type: "array",
                items: { $ref: "#/components/schemas/UserProfile" },
            },
        },
        required: ["ok", "data"],
    },

    DailyPlan: {
        type: "object",
        properties: {
            dailyplan_id: { type: "integer" },
            user_id: { type: "integer" },
            date: { type: "string", format: "date-time" },
            target: { type: "number" },
            total_intake_ml: { type: "number" },
            deviation_ml: { type: "number" },
            amount_of_intakes: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
        },
    },

    DailyPlanCreate: {
        type: "object",
        properties: {
            user_id: { type: "integer" },
            date: { type: "string", format: "date-time" },
            target: { type: "number" },
        },
        required: ["user_id", "date"],
    },

    OkDailyPlan: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/DailyPlan" },
        },
        required: ["ok", "data"],
    },

    OkDailyPlansList: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: {
                type: "array",
                items: { $ref: "#/components/schemas/DailyPlan" },
            },
        },
        required: ["ok", "data"],
    },

    Activity: {
        type: "object",
        properties: {
            activity_id: { type: "integer" },
            dailyplan_id: { type: "integer" },
            activity_type: { type: "string" },
            intensity: { type: "string" },
            start_time: { type: "string", format: "date-time" },
            end_time: { type: "string", format: "date-time" },
            duration: { type: "integer" },
            extra_hydration_ml: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
        },
    },

    ActivityCreate: {
        type: "object",
        properties: {
            dailyplan_id: { type: "integer" },
            activity_type: { type: "string" },
            intensity: { type: "string" },
            start_time: { type: "string", format: "date-time" },
            end_time: { type: "string", format: "date-time" },
            duration: { type: "integer" },
            extra_hydration_ml: { type: "number" },
        },
        required: ["dailyplan_id"],
    },

    OkActivity: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Activity" },
        },
        required: ["ok", "data"],
    },

    OkActivitiesList: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: {
                type: "array",
                items: { $ref: "#/components/schemas/Activity" },
            },
        },
        required: ["ok", "data"],
    },

    Intake: {
        type: "object",
        properties: {
            intake_id: { type: "integer" },
            dailyplan_id: { type: "integer" },
            volume_ml: { type: "number" },
            intake_time: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
        },
    },

    IntakeCreate: {
        type: "object",
        properties: {
            dailyplan_id: { type: "integer" },
            volume_ml: { type: "number" },
            intake_time: { type: "string", format: "date-time" },
        },
        required: ["dailyplan_id"],
    },

    OkIntake: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Intake" },
        },
        required: ["ok", "data"],
    },

    OkIntakesList: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: {
                type: "array",
                items: { $ref: "#/components/schemas/Intake" },
            },
        },
        required: ["ok", "data"],
    },

    Recommendation: {
        type: "object",
        properties: {
            recommendation_id: { type: "integer" },
            intake_id: { type: "integer" },
            recommend_type: { type: "string" },
            message: { type: "string" },
            severity: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
        },
    },

    RecommendationCreate: {
        type: "object",
        properties: {
            intake_id: { type: "integer" },
            recommend_type: { type: "string" },
            message: { type: "string" },
            severity: { type: "string" },
        },
        required: ["intake_id"],
    },

    OkRecommendation: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Recommendation" },
        },
        required: ["ok", "data"],
    },

    OkRecommendationsList: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: {
                type: "array",
                items: { $ref: "#/components/schemas/Recommendation" },
            },
        },
        required: ["ok", "data"],
    },

    Notification: {
        type: "object",
        properties: {
            notification_id: { type: "integer" },
            recommendation_id: { type: "integer" },
            notification_type: { type: "string" },
            title: { type: "string" },
            body: { type: "string" },
            status: { type: "string" },
            sent_at: { type: "string", format: "date-time" },
            channel: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
        },
    },

    NotificationCreate: {
        type: "object",
        properties: {
            recommendation_id: { type: "integer" },
            notification_type: { type: "string" },
            title: { type: "string" },
            body: { type: "string" },
            channel: { type: "string" },
        },
        required: ["recommendation_id"],
    },

    OkNotification: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Notification" },
        },
        required: ["ok", "data"],
    },

    OkNotificationsList: {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: {
                type: "array",
                items: { $ref: "#/components/schemas/Notification" },
            },
        },
        required: ["ok", "data"],
    },
};
