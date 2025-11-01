// Role Based Access Control (RBAC) for AttendX

// Final rules:
// - Admin (institute_admin): manage ALL attendance + manage users + manage teacher attendance + create teachers + create students
// - Teacher: manage student attendance only + can create student logins
// - Student: read-only self attendance (semester-wise)
const RULES = Object.freeze({
    // attendance
    'attendance:manage_all':           ['institute_admin'],
    'attendance:create':               ['institute_admin', 'teacher'],
    'attendance:update':               ['institute_admin', 'teacher'],
    'attendance:self:read':            ['student', 'teacher', 'institute_admin'],

    // teacher-attendance (admin-only)
    'teacher_attendance:create':       ['institute_admin'],
    'teacher_attendance:update':       ['institute_admin'],
    'teacher_attendance:self:read':    ['teacher', 'institute_admin'],

    // user management
    'users:manage_teachers':           ['institute_admin'],
    'users:manage_students':           ['institute_admin'],
    'users:create_teacher':            ['institute_admin'],
    'users:create_student':            ['institute_admin', 'teacher'], // teacher can create student logins
});

export function can(role, action) {
    const allow = RULES[action];
    return !!(allow && allow.includes(role));
}

export function visible(role, actions = []) {
    return actions.every(a => can(role, a));
}
