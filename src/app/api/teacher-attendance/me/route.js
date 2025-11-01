export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import TeacherAttendance from '@/lib/models/TeacherAttendance';

// /api/teacher-attendance/me?month=YYYY-MM
export async function GET(request) {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (user.role !== 'teacher' && user.role !== 'institute_admin') return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // e.g. 2025-11
    await dbConnect();

    const q = { teacherId: user.id };
    if (month && /^\d{4}-\d{2}$/.test(month)) q.date = new RegExp(`^${month}`);

    const rows = await TeacherAttendance.find(q).sort({ date: -1 }).lean();

    const total = rows.length;
    const present = rows.filter(r => r.status === 'present').length;
    const late = rows.filter(r => r.status === 'late').length;
    const excused = rows.filter(r => r.status === 'excused').length;
    const absent = rows.filter(r => r.status === 'absent').length;
    const percent = total ? Math.round((present / total) * 100) : 0;

    return new Response(JSON.stringify({ month: month || 'all', total, present, late, excused, absent, percent, rows }), { status: 200 });
}
