import { NextRequest, NextResponse } from "next/server";

export function GET(req) {
  const accessToken = req.cookies.get("accessToken")?.value || null;
  const refreshToken = req.cookies.get("refreshToken")?.value || null;

  return NextResponse.json({
    accessToken,
    refreshToken,
  });
}
