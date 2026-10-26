import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: "If the email exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    // TODO: Buyer should integrate their email provider here
    // For now, log the link so the buyer can test locally
    console.log(`\n========================================`);
    console.log(`PASSWORD RESET LINK FOR: ${email}`);
    console.log(`${resetUrl}`);
    console.log(`========================================\n`);

    // If Resend is configured, send the email
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder_key") {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "PULSE <onboarding@resend.dev>",
          to: email,
          subject: "Reset your PULSE password",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
              <h2>Reset Your Password</h2>
              <p>Click the link below to reset your password. This link expires in 1 hour.</p>
              <a href="${resetUrl}" style="display: inline-block; background: #0B0D0C; color: #C6FF00; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
                Reset Password
              </a>
              <p style="color: #6B7A6F; font-size: 12px;">If you did not request this, ignore this email.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send reset email:", emailErr);
      }
    }

    return NextResponse.json({ message: "If the email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
