export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import Student from '@/lib/models/Student';
import { getUserFromRequest } from '@/lib/auth';
import { can } from '@/lib/rbac';

export async function GET(request) {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

    // Teachers and Admins can view student list
    if (!(can(user.role, 'attendance:create') || user.role === 'institute_admin')) {
        return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    await dbConnect();
    const students = await Student.find({}).sort({ name: 1 }).lean();
    return new Response(JSON.stringify(students), { status: 200 });
}
