/**
 * Налаштовує Prisma ORM для роботи з базою даних PostgreSQL.
 * 
 * @requires prisma - Пакет Prisma CLI
 * @requires dotenv - Пакет для завантаження змінних оточення
 * 
 * @property {string} schema - Шлях до файлу схеми Prisma
 * @property {Object} migrations - Налаштування міграцій
 * @property {string} migrations.path - Шлях до директорії з міграціями
 * @property {Object} datasource - Налаштування джерела даних
 * @property {string} datasource.url - URL підключення до БД (з змінної оточення DATABASE_URL)
 */
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
});