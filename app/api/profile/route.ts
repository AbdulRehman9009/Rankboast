import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// ── Validation schemas ────────────────────────────────────────────────────────
const updateProfileSchema = z.object({
    name: z.string().min(2).max(80).trim().optional(),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
});

// ── GET — return safe profile fields ─────────────────────────────────────────
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            // NEVER return password or any internal fields
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                subscription: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Aggregate stats in one extra query
        const [audits, comparisons, content] = await Promise.all([
            prisma.analysis.count({ where: { userId: user.id } }),
            prisma.competitor.count({ where: { userId: user.id } }),
            prisma.generatedContent.count({ where: { userId: user.id } }),
        ]);

        return NextResponse.json({
            user,
            stats: { audits, comparisons, content },
        });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// ── PATCH — update name ───────────────────────────────────────────────────────
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = updateProfileSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
        }

        const { name } = parsed.data;
        if (!name) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { name },
        });

        return NextResponse.json({ message: "Profile updated successfully" });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// ── POST /api/profile/password — change password ──────────────────────────────
// Handled via POST body action field to keep it in one route file
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = changePasswordSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
        }

        const { currentPassword, newPassword } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true },
        });

        if (!user?.password) {
            return NextResponse.json({ error: "Cannot change password for OAuth accounts" }, { status: 400 });
        }

        const matches = await bcrypt.compare(currentPassword, user.password);
        if (!matches) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }

        const hashed = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashed },
        });

        return NextResponse.json({ message: "Password changed successfully" });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
