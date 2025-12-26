import { NextRequest } from 'next/server'
import { notificationService } from '@/lib/services/notification.service'
import { successResponse } from '@/lib/http/responses'
import { handleError } from '@/lib/http/errors'
import { parseQueryInt, parseQueryString } from '@/lib/http/params'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      recommendation_id: parseQueryInt(searchParams.get('recommendation_id'), 'recommendation_id'),
      status: parseQueryString(searchParams.get('status')),
      channel: parseQueryString(searchParams.get('channel')),
    }
    const notifications = await notificationService.findAll(filters)
    return successResponse(notifications)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const notification = await notificationService.create(body)
    return successResponse(notification, 201)
  } catch (error) {
    return handleError(error)
  }
}

