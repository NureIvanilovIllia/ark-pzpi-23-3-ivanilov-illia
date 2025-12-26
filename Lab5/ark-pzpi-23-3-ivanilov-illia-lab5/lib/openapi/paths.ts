export const paths = {
    "/api/users": {
        get: {
            tags: ["Users"],
            summary: "Список користувачів",
            parameters: [
                {
                    name: "email",
                    in: "query",
                    schema: { type: "string" },
                },
                {
                    name: "role",
                    in: "query",
                    schema: { type: "string" },
                },
                {
                    name: "status",
                    in: "query",
                    schema: { type: "string" },
                },
            ],
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkUsersList",
                            },
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Users"],
            summary: "Створити користувача",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UserCreate",
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Created",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkUser",
                            },
                        },
                    },
                },
                "409": { description: "Conflict" },
            },
        },
    },

    "/api/users/{id}": {
        get: {
            tags: ["Users"],
            summary: "Отримати користувача за id",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkUser",
                            },
                        },
                    },
                },
                "404": { description: "Not found" },
            },
        },
        patch: {
            tags: ["Users"],
            summary: "Оновити користувача",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UserPatch",
                        },
                    },
                },
            },
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkUser",
                            },
                        },
                    },
                },
                "404": { description: "Not found" },
            },
        },
        delete: {
            tags: ["Users"],
            summary: "Видалити користувача",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "204": { description: "No Content" },
                "404": { description: "Not found" },
            },
        },
    },

    "/api/profiles": {
        get: {
            tags: ["User Profiles"],
            summary: "Список профілів користувачів",
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkUserProfilesList",
                            },
                        },
                    },
                },
            },
        },
        post: {
            tags: ["User Profiles"],
            summary: "Створити профіль користувача",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UserProfileCreate",
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Created",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkUserProfile",
                            },
                        },
                    },
                },
            },
        },
    },

    "/api/profiles/{id}": {
        get: {
            tags: ["User Profiles"],
            summary: "Отримати профіль за id",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkUserProfile",
                            },
                        },
                    },
                },
                "404": { description: "Not found" },
            },
        },
        patch: {
            tags: ["User Profiles"],
            summary: "Оновити профіль",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/UserProfile" },
                    },
                },
            },
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkUserProfile",
                            },
                        },
                    },
                },
                "404": { description: "Not found" },
            },
        },
        delete: {
            tags: ["User Profiles"],
            summary: "Видалити профіль",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "204": { description: "No Content" },
                "404": { description: "Not found" },
            },
        },
    },

    "/api/daily-plans": {
        get: {
            tags: ["Daily Plans"],
            summary: "Список щоденних планів",
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkDailyPlansList",
                            },
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Daily Plans"],
            summary: "Створити щоденний план",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/DailyPlanCreate",
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Created",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkDailyPlan",
                            },
                        },
                    },
                },
            },
        },
    },

    "/api/daily-plans/{id}": {
        get: {
            tags: ["Daily Plans"],
            summary: "Отримати щоденний план за id",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkDailyPlan",
                            },
                        },
                    },
                },
                "404": { description: "Not found" },
            },
        },
        patch: {
            tags: ["Daily Plans"],
            summary: "Оновити щоденний план",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/DailyPlan" },
                    },
                },
            },
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkDailyPlan",
                            },
                        },
                    },
                },
                "404": { description: "Not found" },
            },
        },
        delete: {
            tags: ["Daily Plans"],
            summary: "Видалити щоденний план",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "204": { description: "No Content" },
                "404": { description: "Not found" },
            },
        },
    },

    "/api/activities": {
        get: {
            tags: ["Activities"],
            summary: "Список активностей",
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkActivitiesList",
                            },
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Activities"],
            summary: "Створити активність",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/ActivityCreate" },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Created",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/OkActivity" },
                        },
                    },
                },
            },
        },
    },

    "/api/activities/{id}": {
        get: {
            tags: ["Activities"],
            summary: "Отримати активність за id",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/OkActivity" },
                        },
                    },
                },
                "404": { description: "Not found" },
            },
        },
        patch: {
            tags: ["Activities"],
            summary: "Оновити активність",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/Activity" },
                    },
                },
            },
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/OkActivity" },
                        },
                    },
                },
                "404": { description: "Not found" },
            },
        },
        delete: {
            tags: ["Activities"],
            summary: "Видалити активність",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "204": { description: "No Content" },
                "404": { description: "Not found" },
            },
        },
    },

    "/api/intakes": {
        get: {
            tags: ["Intakes"],
            summary: "Список прийомів води",
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkIntakesList",
                            },
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Intakes"],
            summary: "Створити прийом води",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/IntakeCreate" },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Created",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/OkIntake" },
                        },
                    },
                },
            },
        },
    },

    "/api/intakes/{id}": {
        get: {
            tags: ["Intakes"],
            summary: "Отримати прийом води за id",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/OkIntake" },
                        },
                    },
                },
                "404": { description: "Not found" },
            },
        },
        patch: {
            tags: ["Intakes"],
            summary: "Оновити прийом води",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/Intake" },
                    },
                },
            },
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/OkIntake" },
                        },
                    },
                },
                "404": { description: "Not found" },
            },
        },
        delete: {
            tags: ["Intakes"],
            summary: "Видалити прийом води",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "204": { description: "No Content" },
                "404": { description: "Not found" },
            },
        },
    },

    "/api/recommendations": {
        get: {
            tags: ["Recommendations"],
            summary: "Список рекомендацій",
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkRecommendationsList",
                            },
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Recommendations"],
            summary: "Створити рекомендацію",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RecommendationCreate",
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Created",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkRecommendation",
                            },
                        },
                    },
                },
            },
        },
    },

    "/api/recommendations/{id}": {
        get: {
            tags: ["Recommendations"],
            summary: "Отримати рекомендацію за id",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkRecommendation",
                            },
                        },
                    },
                },
                "404": { description: "Not found" },
            },
        },
        patch: {
            tags: ["Recommendations"],
            summary: "Оновити рекомендацію",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/Recommendation" },
                    },
                },
            },
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkRecommendation",
                            },
                        },
                    },
                },
                "404": { description: "Not found" },
            },
        },
        delete: {
            tags: ["Recommendations"],
            summary: "Видалити рекомендацію",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "204": { description: "No Content" },
                "404": { description: "Not found" },
            },
        },
    },

    "/api/notifications": {
        get: {
            tags: ["Notifications"],
            summary: "Список сповіщень",
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkNotificationsList",
                            },
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Notifications"],
            summary: "Створити сповіщення",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/NotificationCreate",
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Created",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkNotification",
                            },
                        },
                    },
                },
            },
        },
    },

    "/api/notifications/{id}": {
        get: {
            tags: ["Notifications"],
            summary: "Отримати сповіщення за id",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkNotification",
                            },
                        },
                    },
                },
                "404": { description: "Not found" },
            },
        },
        patch: {
            tags: ["Notifications"],
            summary: "Оновити сповіщення",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/Notification" },
                    },
                },
            },
            responses: {
                "200": {
                    description: "OK",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/OkNotification",
                            },
                        },
                    },
                },
                "404": { description: "Not found" },
            },
        },
        delete: {
            tags: ["Notifications"],
            summary: "Видалити сповіщення",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                "204": { description: "No Content" },
                "404": { description: "Not found" },
            },
        },
    },
};
