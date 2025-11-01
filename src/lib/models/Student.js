import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    studentId: { type: String, unique: true, index: true }, // e.g., 'alice-demo'
    name: { type: String, required: true },
    semester: { type: String, required: true },             // e.g., 'Fall-2025'
    email: { type: String },                                 // optional mapping to user email
}, { timestamps: true });

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
