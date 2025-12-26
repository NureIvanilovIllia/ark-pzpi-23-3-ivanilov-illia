import { NextRequest } from 'next/server'
import { notificationService } from '@/lib/services/notification.service'
import { successResponse, noContentResponse } from '@/lib/http/responses'
import { handleError } from '@/lib/http/errors'
import { parseId } from '@/lib/http/params'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const notificationId = parseId(id)
    const notification = await notificationService.findById(notificationId)
    return successResponse(notification)
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
    const notificationId = parseId(id)
    const body = await request.json()
    const notification = await notificationService.update(notificationId, body)
    return successResponse(notification)
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
    const notificationId = parseId(id)
    await notificationService.delete(notificationId)
    return noContentResponse()
  } catch (error) {
    return handleError(error)
  }
}

