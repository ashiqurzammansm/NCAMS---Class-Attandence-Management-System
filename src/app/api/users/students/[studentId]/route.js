export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import User from '@/lib/models/User';
import Student from '@/lib/models/Student';
import StudentAttendance from '@/lib/models/StudentAttendance';

export async function DELETE(request, { params }) {
    const me = getUserFromRequest(request);
    if (!me) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (me.role !== 'teacher' && me.role !== 'institute_admin')
        return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

    const { studentId } = params || {};
    if (!studentId) return new Response(JSON.stringify({ message: 'studentId required' }), { status: 400 });

    await dbConnect();

    const s = await Student.findOne({ studentId });
    if (!s) return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });

    // Remove User by email (student accounts are users with role: student)
    await User.deleteOne({ email: s.email, role: 'student' });
    await StudentAttendance.deleteMany({ studentId });
    await Student.deleteOne({ studentId });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
