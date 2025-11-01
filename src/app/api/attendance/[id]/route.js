export const runtime = 'nodejs';

import { dbConnect } from "@/lib/db";
import Attendance from "@/lib/models/Attendance";
import Session from "@/lib/models/Session";
import { getUserFromRequest } from "@/lib/auth";
import { can } from "@/lib/rbac";

// Update attendance rows
export async function PUT(request, { params }) {
    const user = getUserFromRequest(request);
    if (!user) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }
    if (!can(user.role, 'attendance:update')) {
        return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });
    }

    await dbConnect();

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const rows = body?.rows || [];

    const ops = rows.map((r) => ({
        updateOne: {
            filter: { sessionId: id, studentId: r.studentId },
            update: { $set: { status: r.status, remark: r.remark || "" } },
            upsert: true,
        },
    }));
    if (ops.length) await Attendance.bulkWrite(ops);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}

// Publish a session
export async function POST(request, { params }) {
    const user = getUserFromRequest(request);
    if (!user) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }
    if (!can(user.role, 'attendance:update')) {
        return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });
    }

    await dbConnect();

    const { id } = params;
    await Session.findByIdAndUpdate(id, { status: "published" });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
}
