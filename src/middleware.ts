import { NextResponse, NextRequest } from "next/server";

const buyerUrl = process.env.NEXT_PUBLIC_BUYER_URL || "http://localhost:3001";

// Decode JWT payload without a library (base64url → JSON)
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

// Pages that don't require authentication
const PUBLIC_ROUTES = ["/user-flow", "/create-account", "/additional-details"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export default function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;
  const event = searchParams.get("event");

  // Public routes (auth flow pages) — allow without token
  if (isPublicRoute(pathname)) {
    // If already logged in and visiting auth pages, check role first
    if (accessToken && pathname === "/user-flow") {
      const payload = decodeJwtPayload(accessToken);
      const role = payload?.role as string | undefined;
      const isPostPropertyFlow = searchParams.get("postProperty") === "true";
      const isSignupFlow = searchParams.get("flow") === "signup" || searchParams.get("isOtp") === "true";
      // END_USER can access /user-flow ONLY for post-property registration or signup OTP
      if ((role === "END_USER" || role === "USER") && !isPostPropertyFlow && !isSignupFlow) {
        return NextResponse.redirect(buyerUrl);
      }
      // Owner/CP already logged in → go to dashboard
      if (role !== "END_USER" && role !== "USER") {
        return NextResponse.redirect(new URL("/user-dashboard", req.url));
      }
      // END_USER with postProperty=true → show registration form
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  // Root path — redirect based on auth status
  if (pathname === "/") {
    if (accessToken) {
      const payload = decodeJwtPayload(accessToken);
      const role = payload?.role as string | undefined;
      if (role === "END_USER" || role === "USER") {
        return NextResponse.redirect(buyerUrl);
      }
      return NextResponse.redirect(new URL("/user-dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/user-flow?isLogin=true", req.url));
  }

  // All other routes require authentication
  if (!accessToken && !event) {
    return NextResponse.redirect(new URL("/user-flow?isLogin=true", req.url));
  }

  // Block END_USER from accessing any seller page
  if (accessToken) {
    const payload = decodeJwtPayload(accessToken);
    const role = payload?.role as string | undefined;
    if (role === "END_USER" || role === "USER") {
      return NextResponse.redirect(buyerUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.svg$.*|.*\\.jpg$).*)",
  ],
};
