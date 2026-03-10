import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(128),
});

// GET — validate token (called by the reset page on mount to check if valid before showing form)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ valid: false, error: "Token is required" }, { status: 400 });
        }

        const record = await prisma.passwordResetToken.findUnique({
            where: { token },
            select: { expires: true },
        });

        if (!record) {
            return NextResponse.json({ valid: false, error: "Invalid or expired reset link" });
        }

        if (record.expires < new Date()) {
            await prisma.passwordResetToken.delete({ where: { token } });
            return NextResponse.json({ valid: false, error: "This reset link has expired. Please request a new one." });
        }

        return NextResponse.json({ valid: true });
    } catch {
        return NextResponse.json({ valid: false, error: "Internal Server Error" }, { status: 500 });
    }
}

// POST — consume token and set new password
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Invalid input" },
                { status: 400 }
            );
        }

        const { token, password } = parsed.data;

        const record = await prisma.passwordResetToken.findUnique({
            where: { token },
            select: { userId: true, expires: true },
        });

        if (!record) {
            return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
        }

        if (record.expires < new Date()) {
            await prisma.passwordResetToken.delete({ where: { token } });
            return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
        }

        const hashed = await bcrypt.hash(password, 12);

        // Update password and delete the token atomically
        await prisma.$transaction([
            prisma.user.update({
                where: { id: record.userId },
                data: { password: hashed },
            }),
            prisma.passwordResetToken.delete({ where: { token } }),
        ]);

        return NextResponse.json({ message: "Password reset successfully. You can now sign in." });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
