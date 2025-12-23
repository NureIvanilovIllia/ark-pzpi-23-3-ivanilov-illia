import { NextRequest } from 'next/server'
import { userProfileService } from '@/lib/services/userProfile.service'
import { successResponse } from '@/lib/http/responses'
import { handleError } from '@/lib/http/errors'
import { parseQueryInt } from '@/lib/http/params'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      user_id: parseQueryInt(searchParams.get('user_id'), 'user_id'),
    }
    const profiles = await userProfileService.findAll(filters)
    return successResponse(profiles)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const profile = await userProfileService.create(body)
    return successResponse(profile, 201)
  } catch (error) {
    return handleError(error)
  }
}

