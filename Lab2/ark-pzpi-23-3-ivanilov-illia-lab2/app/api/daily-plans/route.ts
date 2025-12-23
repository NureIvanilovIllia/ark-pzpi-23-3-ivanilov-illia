import { NextRequest } from 'next/server'
import { dailyPlanService } from '@/lib/services/dailyPlan.service'
import { successResponse } from '@/lib/http/responses'
import { handleError } from '@/lib/http/errors'
import { parseQueryInt, parseQueryString } from '@/lib/http/params'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      user_id: parseQueryInt(searchParams.get('user_id'), 'user_id'),
      date: parseQueryString(searchParams.get('date')),
    }
    const plans = await dailyPlanService.findAll(filters)
    return successResponse(plans)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const plan = await dailyPlanService.create(body)
    return successResponse(plan, 201)
  } catch (error) {
    return handleError(error)
  }
}

