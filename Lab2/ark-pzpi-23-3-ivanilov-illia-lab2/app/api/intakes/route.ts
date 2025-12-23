import { NextRequest } from 'next/server'
import { intakeService } from '@/lib/services/intake.service'
import { successResponse } from '@/lib/http/responses'
import { handleError } from '@/lib/http/errors'
import { parseQueryInt, parseQueryString } from '@/lib/http/params'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      dailyplan_id: parseQueryInt(searchParams.get('dailyplan_id'), 'dailyplan_id'),
      from: parseQueryString(searchParams.get('from')),
      to: parseQueryString(searchParams.get('to')),
    }
    const intakes = await intakeService.findAll(filters)
    return successResponse(intakes)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const intake = await intakeService.create(body)
    return successResponse(intake, 201)
  } catch (error) {
    return handleError(error)
  }
}

