import { errorResponse } from './responses'

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      'NOT_FOUND',
      id ? `${resource} with id ${id} not found` : `${resource} not found`,
      404
    )
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super('CONFLICT', message, 409, details)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details)
  }
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return errorResponse(error.code, error.message, error.status, error.details)
  }

  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> }
    return errorResponse(
      'VALIDATION_ERROR',
      'Validation failed',
      400,
      zodError.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      }))
    )
  }

  if (error instanceof Error) {
    return errorResponse('INTERNAL_ERROR', error.message, 500)
  }

  return errorResponse('UNKNOWN_ERROR', 'An unknown error occurred', 500)
}

