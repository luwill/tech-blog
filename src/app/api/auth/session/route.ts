import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

// Debug endpoint to check session
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json({
      session,
      timestamp: new Date().toISOString(),
      url: request.url
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({
      error: "Failed to get session",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}