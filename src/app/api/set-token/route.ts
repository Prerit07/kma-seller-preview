import { NextResponse } from "next/server";

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString();
    return JSON.parse(json);
  } catch { return null; }
}

function buildCookie(
  name: string,
  value: string,
  maxAge: number,
  httpOnly = true,
  sameSite: "Lax" | "None" = "Lax",
): string {
  let cookie = `${name}=${value}; Path=/; Max-Age=${maxAge}; Secure; SameSite=${sameSite}`;
  if (httpOnly) cookie += "; HttpOnly";
  if (COOKIE_DOMAIN) cookie += `; Domain=${COOKIE_DOMAIN}`;
  return cookie;
}

function attachAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  sameSite: "Lax" | "None" = "Lax",
) {
  response.headers.append("Set-Cookie", buildCookie("accessToken", accessToken, 60 * 60, true, sameSite));
  response.headers.append("Set-Cookie", buildCookie("refreshToken", refreshToken, 60 * 60 * 24 * 7, true, sameSite));

  // JS-readable kma_user cookie so buyer/seller header can detect logged-in user
  const payload = decodeJwtPayload(accessToken);
  if (payload?.role) {
    const userObj = encodeURIComponent(JSON.stringify({
      role: payload.role,
      name: payload.name || "",
    }));
    response.headers.append("Set-Cookie", buildCookie("kma_user", userObj, 60 * 60, false, sameSite));
  }
}

export async function POST(req: Request) {
  const { accessToken, refreshToken } = await req.json();

  const response = NextResponse.json({ message: "Tokens set" });
  attachAuthCookies(response, accessToken, refreshToken);
  return response;
}

/**
 * GET variant for cross-domain handoff (e.g. admin panel → seller app).
 * Reads accessToken/refreshToken from query params, sets the same cookies
 * the POST variant sets, then 302 redirects to the requested path. The
 * redirect path is restricted to same-origin paths to avoid open redirects.
 *
 * On Amplify the request hits the app on localhost behind a reverse proxy,
 * so `new URL(req.url).origin` is `http://localhost:3000`. Use the
 * x-forwarded-host / host headers (and x-forwarded-proto) to recover the
 * real public origin for the redirect.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const accessToken = url.searchParams.get("at") ?? "";
  const refreshToken = url.searchParams.get("rt") ?? "";
  const requested = url.searchParams.get("redirect") ?? "/user-dashboard";
  const safeRedirect = requested.startsWith("/") && !requested.startsWith("//")
    ? requested
    : "/user-dashboard";

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost ?? req.headers.get("host") ?? url.host;
  const proto = req.headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const target = `${proto}://${host}${safeRedirect}`;

  // Embed=1 means the caller is loading us inside a cross-site iframe
  // (e.g. the admin panel). SameSite=None+Secure cookies are required for
  // the browser to send them on the post-redirect request inside the
  // iframe. Lax cookies would simply not be attached.
  const embed = url.searchParams.get("embed") === "1";
  const sameSite = embed ? "None" : "Lax";

  const response = NextResponse.redirect(target, 302);
  attachAuthCookies(response, accessToken, refreshToken, sameSite);
  return response;
}
