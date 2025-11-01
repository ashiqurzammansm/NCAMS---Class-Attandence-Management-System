export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Student from '@/lib/models/Student';
import StudentAttendance from '@/lib/models/StudentAttendance';

function inRange(d, a, b) {
    if (!a && !b) return true;
    if (a && d < a) return false;
    if (b && d > b) return false;
    return true;
}

export async function GET(request) {
    const user = getUserFromRequest(request);
    if (!user) return new Response('Unauthorized', { status: 401 });

    if (user.role !== 'student' && user.role !== 'institute_admin' && user.role !== 'teacher') {
        return new Response('Forbidden', { status: 403 });
    }

    const url = new URL(request.url);
    const semester = url.searchParams.get('semester') || '';
    const dateFrom = url.searchParams.get('dateFrom') || '';
    const dateTo = url.searchParams.get('dateTo') || '';

    await dbConnect();

    const s = await Student.findOne({ email: user.email }).lean();
    if (!s?.studentId) return new Response('No student record', { status: 404 });

    const query = { studentId: s.studentId };
    if (semester) query.semester = semester;

    const rows = await StudentAttendance.find(query).sort({ date: 1 }).lean();
    const filtered = rows.filter(r => inRange(r.date, dateFrom, dateTo));

    const header = ['studentId','semester','date','status'];
    const lines = [header.join(',')].concat(
        filtered.map(r => [r.studentId, `"${r.semester}"`, r.date, r.status].join(','))
    );
    const csv = lines.join('\r\n');

    return new Response(csv, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="student-attendance-${s.studentId}.csv"`,
            'Cache-Control': 'no-store',
        },
    });
}
