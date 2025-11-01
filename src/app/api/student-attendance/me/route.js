export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Student from '@/lib/models/Student';
import StudentAttendance from '@/lib/models/StudentAttendance';

// /api/student-attendance/me?semester=Fall-2025
export async function GET(request) {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (user.role !== 'student' && user.role !== 'institute_admin' && user.role !== 'teacher')
        return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

    await dbConnect();

    // find their student card to know their studentId + default semester
    const s = await Student.findOne({ email: user.email }).lean();
    const studentId = s?.studentId || null;
    if (!studentId) return new Response(JSON.stringify({ message: 'No student record found' }), { status: 404 });

    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester') || s?.semester || 'Unknown';

    const rows = await StudentAttendance.find({ studentId, semester }).sort({ date: -1 }).lean();

    const total = rows.length;
    const present = rows.filter(r => r.status === 'present').length;
    const late = rows.filter(r => r.status === 'late').length;
    const excused = rows.filter(r => r.status === 'excused').length;
    const absent = rows.filter(r => r.status === 'absent').length;
    const percent = total ? Math.round((present / total) * 100) : 0;

    return new Response(JSON.stringify({ studentId, semester, total, present, late, excused, absent, percent, rows }), { status: 200 });
}
