export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import TeacherAttendance from '@/lib/models/TeacherAttendance';
import TeacherSession from '@/lib/models/TeacherSession';
import { getUserFromRequest } from '@/lib/auth';
import { can } from '@/lib/rbac';

export async function PUT(request, { params }) {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (!can(user.role, 'teacher_attendance:update')) {
        return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    await dbConnect();
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const rows = body?.rows || [];

    const ops = rows.map(r => ({
        updateOne: {
            filter: { sessionId: id, teacherId: r.teacherId },
            update: { $set: { status: r.status, remark: r.remark || '' } },
            upsert: true
        }
    }));
    if (ops.length) await TeacherAttendance.bulkWrite(ops);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function POST(request, { params }) {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (!can(user.role, 'teacher_attendance:update')) {
        return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    await dbConnect();
    const { id } = params;
    await TeacherSession.findByIdAndUpdate(id, { status: 'published' });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
}
