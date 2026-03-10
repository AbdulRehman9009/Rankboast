import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";



export async function POST(request: Request) {
    const { name, email, password } = await request.json();
    if(!name || !email || !password) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if(existingUser) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: "USER",         // Professional field from your new schema
            subscription: "FREE",
        },
    });

    return NextResponse.json({ name, email }, { status: 201 });
}