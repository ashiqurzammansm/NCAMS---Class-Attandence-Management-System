import mongoose from 'mongoose';

const StudentAttendanceSchema = new mongoose.Schema({
    studentId: { type: String, required: true, index: true }, // our Student.studentId string
    date: { type: String, required: true, index: true },      // YYYY-MM-DD
    semester: { type: String, required: true },               // saved snapshot for filtering
    status: { type: String, enum: ['present', 'late', 'excused', 'absent'], default: 'present' },
}, { timestamps: true });

// Prevent duplicate record for same student on same date
StudentAttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export default mongoose.models.StudentAttendance ||
mongoose.model('StudentAttendance', StudentAttendanceSchema);
