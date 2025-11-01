import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, index: true },
        studentId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            match: /^SID\d{5}$/, // e.g. SID00001
        },
        semester: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
