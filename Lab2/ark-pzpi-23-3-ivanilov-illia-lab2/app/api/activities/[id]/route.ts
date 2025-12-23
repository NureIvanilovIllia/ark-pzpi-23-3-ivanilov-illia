import { NextRequest } from 'next/server'
import { activityService } from '@/lib/services/activity.service'
import { successResponse, noContentResponse } from '@/lib/http/responses'
import { handleError } from '@/lib/http/errors'
import { parseId } from '@/lib/http/params'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const activityId = parseId(id)
    const activity = await activityService.findById(activityId)
    return successResponse(activity)
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
    const activityId = parseId(id)
    const body = await request.json()
    const activity = await activityService.update(activityId, body)
    return successResponse(activity)
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
    const activityId = parseId(id)
    await activityService.delete(activityId)
    return noContentResponse()
  } catch (error) {
    return handleError(error)
  }
}

