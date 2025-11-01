export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import User from '@/lib/models/User';
import TeacherAttendance from '@/lib/models/TeacherAttendance';

export async function DELETE(request, { params }) {
    const me = getUserFromRequest(request);
    if (!me) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (me.role !== 'institute_admin') return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

    const { id } = params || {};
    if (!id) return new Response(JSON.stringify({ message: 'id required' }), { status: 400 });

    await dbConnect();

    const u = await User.findOne({ _id: id, role: 'teacher' });
    if (!u) return new Response(JSON.stringify({ message: 'Not found' }), { status: 404 });

    await TeacherAttendance.deleteMany({ teacherId: id });
    await User.deleteOne({ _id: id });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
