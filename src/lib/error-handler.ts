import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { HTTP_STATUS, ERROR_CODES } from "./constants"

/**
 * Base API Error class
 */
export class ApiError extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, code: string = ERROR_CODES.INTERNAL_ERROR) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.code = code
  }
}

/**
 * Authentication error - user not logged in
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication required") {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED)
    this.name = "AuthenticationError"
  }
}

/**
 * Authorization error - user lacks permission
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = "Admin access required") {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN)
    this.name = "AuthorizationError"
  }
}

/**
 * Not found error - resource doesn't exist
 */
export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND)
    this.name = "NotFoundError"
  }
}

/**
 * Validation error - invalid input
 */
export class ValidationError extends ApiError {
  readonly details?: Record<string, string[]>

  constructor(message: string = "Validation failed", details?: Record<string, string[]>) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR)
    this.name = "ValidationError"
    this.details = details
  }
}

/**
 * Conflict error - duplicate resource
 */
export class ConflictError extends ApiError {
  constructor(message: string = "Resource already exists") {
    super(message, HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT)
    this.name = "ConflictError"
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends ApiError {
  constructor(message: string = "Too many requests") {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODES.RATE_LIMIT_EXCEEDED)
    this.name = "RateLimitError"
  }
}

/**
 * Format Zod errors into a readable structure
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {}

  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root'
    if (!details[path]) {
      details[path] = []
    }
    details[path].push(issue.message)
  }

  return details
}

/**
 * Main error handler for API routes
 */
export function handleApiError(error: unknown) {
  // Log error in development only
  if (process.env.NODE_ENV === 'development') {
    console.error("API Error:", error)
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details = formatZodErrors(error)
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        code: ERROR_CODES.VALIDATION_ERROR,
        details,
      },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    const response: {
      success: boolean
      error: string
      code: string
      details?: Record<string, string[]>
    } = {
      success: false,
      error: error.message,
      code: error.code,
    }

    // Include validation details if available
    if (error instanceof ValidationError && error.details) {
      response.details = error.details
    }

    return NextResponse.json(response, { status: error.statusCode })
  }

  // Handle standard errors with pattern matching (backward compatibility)
  if (error instanceof Error) {
    // Authentication errors
    if (error.message.includes("User not authenticated")) {
      return NextResponse.json(
        { success: false, error: "Authentication required", code: ERROR_CODES.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    // Authorization errors
    if (error.message.includes("Admin access required")) {
      return NextResponse.json(
        { success: false, error: "Admin access required", code: ERROR_CODES.FORBIDDEN },
        { status: HTTP_STATUS.FORBIDDEN }
      )
    }

    // Database constraint errors
    if (error.message.includes("Unique constraint failed")) {
      return NextResponse.json(
        { success: false, error: "Resource already exists", code: ERROR_CODES.CONFLICT },
        { status: HTTP_STATUS.CONFLICT }
      )
    }

    // In production, don't expose internal error messages
    const message = process.env.NODE_ENV === 'production'
      ? "An unexpected error occurred"
      : error.message

    return NextResponse.json(
      { success: false, error: message, code: ERROR_CODES.INTERNAL_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }

  // Unknown error type
  return NextResponse.json(
    { success: false, error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
  )
}

/**
 * Handle authentication page errors
 */
export function handleAuthError(error: string): string {
  switch (error) {
    case "access-denied":
      return "Access denied. You don't have permission to view this page."
    case "session-required":
      return "Please sign in to continue."
    case "admin-required":
      return "Admin access required."
    case "OAuthAccountNotLinked":
      return "This email is already linked to another account."
    default:
      return "An authentication error occurred."
  }
}
