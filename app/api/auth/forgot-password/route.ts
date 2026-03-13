import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = z.object({
            email: z.string().email("A valid email is required"),
        }).safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }

        const { email } = result.data;

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

            const appUrl = env.NEXTAUTH_URL;
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
