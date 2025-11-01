import mongoose from 'mongoose';
const AttendanceSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Types.ObjectId, ref:'Session' },
  studentId: { type: String }, // demo string id
  status: { type: String, enum:['present','absent','late','excused'], default:'absent' },
  remark: String
},{ timestamps:true });
AttendanceSchema.index({ sessionId:1, studentId:1 }, { unique: true });
export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
