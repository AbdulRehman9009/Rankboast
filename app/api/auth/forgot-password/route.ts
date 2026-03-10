import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Always return success to prevent email enumeration
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            select: { id: true, email: true },
        });

        if (user) {
            // Delete any existing reset tokens for this user
            await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

            // Generate a secure random token
            const token = crypto.randomBytes(32).toString("hex");
            const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            await prisma.passwordResetToken.create({
                data: { token, userId: user.id, expires },
            });

            const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
            const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

            // Fire-and-forget (don't block response on email send)
            sendPasswordResetEmail(user.email, resetUrl).catch((err) => {
                console.error("Email send error:", err);
            });
        }

        // Always return the same success message regardless of whether email exists
        return NextResponse.json({
            message: "If that email is registered, a reset link has been sent.",
        });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
