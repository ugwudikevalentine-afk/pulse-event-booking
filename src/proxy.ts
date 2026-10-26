import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const publicRoutes = [
  "/",
  "/events",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/faq",
  "/terms",
  "/privacy",
  "/about",
  "/contact",
  "/booking/success",
  "/booking/cancel",
  "/api/auth",
  "/api/events",
  "/api/webhooks",
];

const adminRoutes = ["/admin"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublic) {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isAdminRoute) {
    const user = session.user as Record<string, unknown>;
    if (user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
