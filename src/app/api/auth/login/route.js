export const runtime = 'nodejs';

import { dbConnect } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { sign } from "@/lib/auth";

export async function POST(request) {
    await dbConnect();

    const body = await request.json().catch(() => ({}));
    const { email, password } = body || {};
    if (!email || !password) {
        return new Response(JSON.stringify({ message: "Email and password required" }), { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return new Response(JSON.stringify({ message: "Invalid email or password" }), { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        return new Response(JSON.stringify({ message: "Invalid email or password" }), { status: 401 });
    }

    const payload = { id: String(user._id), email: user.email, role: user.role, name: user.name };
    const token = sign(payload);

    const maxAge = 7 * 24 * 60 * 60; // 7 days
    const cookie = [
        `token=${token}`,
        `Path=/`,
        `HttpOnly`,
        `SameSite=Lax`,
        `Max-Age=${maxAge}`,
        process.env.NODE_ENV === 'production' ? 'Secure' : '',
    ].filter(Boolean).join('; ');

    return new Response(JSON.stringify({ token, user: payload }), {
        status: 200,
        headers: {
            'Set-Cookie': cookie,
            'Content-Type': 'application/json',
        },
    });
}
