import mongoose from 'mongoose';

const TeacherAttendanceSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    status: { type: String, enum: ['present', 'late', 'excused', 'absent'], default: 'present' },
}, { timestamps: true });

// Prevent duplicate record for same teacher on same date
TeacherAttendanceSchema.index({ teacherId: 1, date: 1 }, { unique: true });

export default mongoose.models.TeacherAttendance ||
mongoose.model('TeacherAttendance', TeacherAttendanceSchema);
