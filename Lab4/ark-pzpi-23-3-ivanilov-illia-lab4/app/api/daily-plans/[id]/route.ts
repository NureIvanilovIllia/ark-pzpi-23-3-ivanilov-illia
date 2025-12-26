import { NextRequest } from 'next/server'
import { dailyPlanService } from '@/lib/services/dailyPlan.service'
import { successResponse, noContentResponse } from '@/lib/http/responses'
import { handleError } from '@/lib/http/errors'
import { parseId } from '@/lib/http/params'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const planId = parseId(id)
    const plan = await dailyPlanService.findById(planId)
    return successResponse(plan)
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const planId = parseId(id)
    const body = await request.json()
    const plan = await dailyPlanService.update(planId, body)
    return successResponse(plan)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const planId = parseId(id)
    await dailyPlanService.delete(planId)
    return noContentResponse()
  } catch (error) {
    return handleError(error)
  }
}

