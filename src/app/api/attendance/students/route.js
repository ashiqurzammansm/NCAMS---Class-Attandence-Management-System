export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Student from '@/lib/models/Student';
import StudentAttendance from '@/lib/models/StudentAttendance';

function isYMD(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }

export async function POST(request) {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (user.role !== 'teacher' && user.role !== 'institute_admin')
        return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

    const body = await request.json().catch(() => ({}));
    const { date, rows = [] } = body || {};
    if (!isYMD(date)) return new Response(JSON.stringify({ message: 'date (YYYY-MM-DD) required' }), { status: 400 });
    if (!Array.isArray(rows) || rows.length === 0) return new Response(JSON.stringify({ message: 'rows required' }), { status: 400 });

    await dbConnect();

    // find duplicates first
    const sids = rows.map(r => r.studentId);
    const existing = await StudentAttendance.find({ studentId: { $in: sids }, date }).select('studentId').lean();
    if (existing.length) {
        const dups = existing.map(e => e.studentId);
        return new Response(JSON.stringify({ ok: false, duplicates: dups, date }), { status: 409 });
    }

    // fetch semester for each studentId
    const students = await Student.find({ studentId: { $in: sids } }).select('studentId semester').lean();
    const semMap = new Map(students.map(s => [s.studentId, s.semester || 'Unknown']));

    const docs = rows.map(r => ({
        studentId: r.studentId,
        date,
        semester: semMap.get(r.studentId) || 'Unknown',
        status: r.status || 'present'
    }));

    await StudentAttendance.insertMany(docs);
    return new Response(JSON.stringify({ ok: true, inserted: docs.length, date }), { status: 200 });
}
