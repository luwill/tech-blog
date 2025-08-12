import { NextResponse } from "next/server"

export class ApiError extends Error {
  statusCode: number
  code?: string

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.code = code
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    // Handle specific known errors
    if (error.message.includes("User not authenticated")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    if (error.message.includes("Admin access required")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    if (error.message.includes("Unique constraint failed")) {
      return NextResponse.json(
        { error: "Resource already exists" },
        { status: 409 }
      )
    }

    // Generic error
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  // Unknown error
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  )
}

export function handleAuthError(error: string) {
  switch (error) {
    case "access-denied":
      return "Access denied. You don't have permission to view this page."
    case "session-required":
      return "Please sign in to continue."
    case "admin-required":
      return "Admin access required."
    default:
      return "An authentication error occurred."
  }
}