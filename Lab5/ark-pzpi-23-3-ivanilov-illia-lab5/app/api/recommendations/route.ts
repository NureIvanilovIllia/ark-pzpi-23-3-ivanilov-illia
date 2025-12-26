import { NextRequest } from 'next/server'
import { recommendationService } from '@/lib/services/recommendation.service'
import { successResponse } from '@/lib/http/responses'
import { handleError } from '@/lib/http/errors'
import { parseQueryInt, parseQueryString } from '@/lib/http/params'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      intake_id: parseQueryInt(searchParams.get('intake_id'), 'intake_id'),
      severity: parseQueryString(searchParams.get('severity')),
      recommend_type: parseQueryString(searchParams.get('recommend_type')),
    }
    const recommendations = await recommendationService.findAll(filters)
    return successResponse(recommendations)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const recommendation = await recommendationService.create(body)
    return successResponse(recommendation, 201)
  } catch (error) {
    return handleError(error)
  }
}

