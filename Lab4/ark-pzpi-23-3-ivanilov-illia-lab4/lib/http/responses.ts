import { NextResponse } from 'next/server'

export interface SuccessResponse<T = unknown> {
  ok: true
  data: T
}

export interface ErrorResponse {
  ok: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export function successResponse<T>(data: T, status: number = 200): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({ ok: true, data }, { status })
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  )
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

