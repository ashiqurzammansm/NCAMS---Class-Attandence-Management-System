import mongoose from 'mongoose';

const TeacherSessionSchema = new mongoose.Schema({
    date: { type: Date, default: () => new Date() },
    status: { type: String, enum: ['draft','published'], default: 'draft' },
}, { timestamps: true });

export default mongoose.models.TeacherSession || mongoose.model('TeacherSession', TeacherSessionSchema);
