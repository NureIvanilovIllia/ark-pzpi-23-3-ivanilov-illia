import { NextRequest } from 'next/server'
import { recommendationService } from '@/lib/services/recommendation.service'
import { successResponse, noContentResponse } from '@/lib/http/responses'
import { handleError } from '@/lib/http/errors'
import { parseId } from '@/lib/http/params'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const recommendationId = parseId(id)
    const recommendation = await recommendationService.findById(recommendationId)
    return successResponse(recommendation)
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
    const recommendationId = parseId(id)
    const body = await request.json()
    const recommendation = await recommendationService.update(recommendationId, body)
    return successResponse(recommendation)
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
    const recommendationId = parseId(id)
    await recommendationService.delete(recommendationId)
    return noContentResponse()
  } catch (error) {
    return handleError(error)
  }
}

