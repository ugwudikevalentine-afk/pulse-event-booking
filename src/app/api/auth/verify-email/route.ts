import { NextRequest, NextResponse } from "next";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { emailVerified: token },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date().toISOString() },
    });

    return NextResponse.redirect(new URL("/login?verified=true", req.url));
  } catch (err: unknown) {
    console.error("Verify email error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}