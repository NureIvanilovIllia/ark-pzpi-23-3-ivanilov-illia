import { ValidationError } from './errors';

/**
 * Парсить рядковий ID з параметрів маршруту в число з валідацією
 * @param {string} id - Рядкове значення ID для парсингу
 * @returns {number} Парсене позитивне ціле число
 * @throws {ValidationError} Якщо ID невалідний (не число або менше або дорівнює 0)
 */
export function parseId(id: string): number {
  const parsed = parseInt(id, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new ValidationError(`Invalid ID: ${id}. Expected a positive integer.`);
  }
  return parsed;
}

/**
 * Парсить рядковий query параметр в число
 * @param {string | null} value - Значення query параметра для парсингу
 * @param {string} paramName - Назва параметра (використовується в повідомленні про помилку)
 * @returns {number | undefined} Парсене ціле число або undefined, якщо параметр відсутній
 * @throws {ValidationError} Якщо значення невалідне (не є числом)
 */
export function parseQueryInt(
  value: string | null,
  paramName: string
): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new ValidationError(
      `Invalid ${paramName}: ${value}. Expected an integer.`
    );
  }
  return parsed;
}

/**
 * Парсить query параметр як рядок
 * @param {string | null} value - Значення query параметра
 * @returns {string | undefined} Рядок або undefined, якщо параметр відсутній
 */
export function parseQueryString(value: string | null): string | undefined {
  return value || undefined;
}

