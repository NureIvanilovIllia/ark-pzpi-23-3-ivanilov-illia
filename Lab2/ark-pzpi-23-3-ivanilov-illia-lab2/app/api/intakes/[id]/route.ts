import { NextRequest } from 'next/server'
import { intakeService } from '@/lib/services/intake.service'
import { successResponse, noContentResponse } from '@/lib/http/responses'
import { handleError } from '@/lib/http/errors'
import { parseId } from '@/lib/http/params'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const intakeId = parseId(id)
    const intake = await intakeService.findById(intakeId)
    return successResponse(intake)
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
    const intakeId = parseId(id)
    const body = await request.json()
    const intake = await intakeService.update(intakeId, body)
    return successResponse(intake)
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
    const intakeId = parseId(id)
    await intakeService.delete(intakeId)
    return noContentResponse()
  } catch (error) {
    return handleError(error)
  }
}

