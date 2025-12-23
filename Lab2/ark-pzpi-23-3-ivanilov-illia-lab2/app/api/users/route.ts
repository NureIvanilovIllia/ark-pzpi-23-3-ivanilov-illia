import { NextRequest } from 'next/server'
import { userService } from '@/lib/services/user.service'
import { successResponse, errorResponse } from '@/lib/http/responses'
import { handleError } from '@/lib/http/errors'
import { parseQueryString } from '@/lib/http/params'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      email: parseQueryString(searchParams.get('email')),
      role: parseQueryString(searchParams.get('role')),
      status: parseQueryString(searchParams.get('status')),
    }
    const users = await userService.findAll(filters)
    return successResponse(users)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const user = await userService.create(body)
    return successResponse(user, 201)
  } catch (error) {
    return handleError(error)
  }
}

