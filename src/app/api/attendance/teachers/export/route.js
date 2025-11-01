export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import TeacherAttendance from '@/lib/models/TeacherAttendance';

function inRange(d, a, b) {
    if (!a && !b) return true;
    if (a && d < a) return false;
    if (b && d > b) return false;
    return true;
}

export async function GET(request) {
    const user = getUserFromRequest(request);
    if (!user) return new Response('Unauthorized', { status: 401 });
    if (user.role !== 'institute_admin') return new Response('Forbidden', { status: 403 });

    const url = new URL(request.url);
    const dateFrom = url.searchParams.get('dateFrom') || '';
    const dateTo = url.searchParams.get('dateTo') || '';

    await dbConnect();
    const rows = await TeacherAttendance.find({}).sort({ teacherId: 1, date: 1 }).lean();
    const filtered = rows.filter(r => inRange(r.date, dateFrom, dateTo));

    const header = ['teacherId','date','status'];
    const lines = [header.join(',')].concat(
        filtered.map(r => [String(r.teacherId), r.date, r.status].join(','))
    );
    const csv = lines.join('\r\n');

    return new Response(csv, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="teachers-attendance.csv"`,
            'Cache-Control': 'no-store',
        },
    });
}
