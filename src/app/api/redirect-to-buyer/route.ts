import { NextRequest, NextResponse } from "next/server";

const buyerUrl = process.env.NEXT_PUBLIC_BUYER_URL || "http://localhost:3001";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") || "/";
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const url = new URL(path, buyerUrl);

  if (accessToken) {
    url.searchParams.set("_token", accessToken);
    const payload = decodeJwtPayload(accessToken);
    if (payload?.role) {
      url.searchParams.set("_role", String(payload.role));
    }
    if (payload?.name) {
      url.searchParams.set("_name", String(payload.name));
    }
  }
  if (refreshToken) {
    url.searchParams.set("_refresh", refreshToken);
  }

  return NextResponse.redirect(url.toString());
}
