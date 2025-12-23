import { NextRequest } from 'next/server'
import { activityService } from '@/lib/services/activity.service'
import { successResponse } from '@/lib/http/responses'
import { handleError } from '@/lib/http/errors'
import { parseQueryInt } from '@/lib/http/params'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      dailyplan_id: parseQueryInt(searchParams.get('dailyplan_id'), 'dailyplan_id'),
    }
    const activities = await activityService.findAll(filters)
    return successResponse(activities)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const activity = await activityService.create(body)
    return successResponse(activity, 201)
  } catch (error) {
    return handleError(error)
  }
}

