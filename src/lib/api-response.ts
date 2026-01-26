import { NextResponse } from 'next/server'
import { HTTP_STATUS } from './constants'

/**
 * Standardized API response format
 */

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    pages?: number
  }
}

export interface ApiErrorResponse {
  success: false
  error: string
  code: string
  details?: Record<string, string[]>
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  status: number = HTTP_STATUS.OK,
  meta?: ApiSuccessResponse<T>['meta']
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  }

  if (meta) {
    response.meta = meta
  }

  return NextResponse.json(response, { status })
}

/**
 * Create a success response with pagination
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
    pages?: number
  }
): NextResponse<ApiSuccessResponse<T[]>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: pagination.pages ?? Math.ceil(pagination.total / pagination.limit)
    }
  })
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, HTTP_STATUS.CREATED)
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  code: string,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error,
    code,
  }

  if (details) {
    response.details = details
  }

  return NextResponse.json(response, { status })
}

/**
 * Create a not found response (404)
 */
export function notFoundResponse(message: string = 'Resource not found'): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 'NOT_FOUND', HTTP_STATUS.NOT_FOUND)
}

/**
 * Create an unauthorized response (401)
 */
export function unauthorizedResponse(message: string = 'Authentication required'): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 'UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
}

/**
 * Create a forbidden response (403)
 */
export function forbiddenResponse(message: string = 'Access denied'): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 'FORBIDDEN', HTTP_STATUS.FORBIDDEN)
}

/**
 * Create a bad request response (400)
 */
export function badRequestResponse(
  message: string = 'Invalid request',
  details?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 'BAD_REQUEST', HTTP_STATUS.BAD_REQUEST, details)
}

/**
 * Create a conflict response (409)
 */
export function conflictResponse(message: string = 'Resource already exists'): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 'CONFLICT', HTTP_STATUS.CONFLICT)
}

/**
 * Create a rate limit response (429)
 */
export function rateLimitResponse(message: string = 'Too many requests'): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 'RATE_LIMIT_EXCEEDED', HTTP_STATUS.TOO_MANY_REQUESTS)
}

/**
 * Create an internal server error response (500)
 */
export function internalErrorResponse(message: string = 'Internal server error'): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 'INTERNAL_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
}
