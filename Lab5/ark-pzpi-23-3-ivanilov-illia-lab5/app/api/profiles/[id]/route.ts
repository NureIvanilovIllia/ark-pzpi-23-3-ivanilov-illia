import { NextRequest } from 'next/server'
import { userProfileService } from '@/lib/services/userProfile.service'
import { successResponse, noContentResponse } from '@/lib/http/responses'
import { handleError } from '@/lib/http/errors'
import { parseId } from '@/lib/http/params'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profileId = parseId(id)
    const profile = await userProfileService.findById(profileId)
    return successResponse(profile)
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
    const profileId = parseId(id)
    const body = await request.json()
    const profile = await userProfileService.update(profileId, body)
    return successResponse(profile)
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
    const profileId = parseId(id)
    await userProfileService.delete(profileId)
    return noContentResponse()
  } catch (error) {
    return handleError(error)
  }
}

