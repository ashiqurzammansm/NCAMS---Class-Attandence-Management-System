export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import TeacherAttendance from '@/lib/models/TeacherAttendance';

function isYMD(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }

export async function POST(request) {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (user.role !== 'institute_admin') return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

    const body = await request.json().catch(() => ({}));
    const { date, rows = [] } = body || {};
    if (!isYMD(date)) return new Response(JSON.stringify({ message: 'date (YYYY-MM-DD) required' }), { status: 400 });
    if (!Array.isArray(rows) || rows.length === 0) return new Response(JSON.stringify({ message: 'rows required' }), { status: 400 });

    await dbConnect();

    const ids = rows.map(r => r.teacherId);
    const existing = await TeacherAttendance.find({ teacherId: { $in: ids }, date }).select('teacherId').lean();
    if (existing.length) {
        const dups = existing.map(e => String(e.teacherId));
        return new Response(JSON.stringify({ ok: false, duplicates: dups, date }), { status: 409 });
    }

    const docs = rows.map(r => ({ teacherId: r.teacherId, date, status: r.status || 'present' }));
    await TeacherAttendance.insertMany(docs);
    return new Response(JSON.stringify({ ok: true, inserted: docs.length, date }), { status: 200 });
}
