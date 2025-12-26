import { NextRequest } from 'next/server'
import { userService } from '@/lib/services/user.service'
import { successResponse, noContentResponse } from '@/lib/http/responses'
import { handleError } from '@/lib/http/errors'
import { parseId } from '@/lib/http/params'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseId(id)
    const user = await userService.findById(userId)
    return successResponse(user)
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
    const userId = parseId(id)
    const body = await request.json()
    const user = await userService.update(userId, body)
    return successResponse(user)
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
    const userId = parseId(id)
    await userService.delete(userId)
    return noContentResponse()
  } catch (error) {
    return handleError(error)
  }
}

