import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, index: true },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            enum: ['institute_admin', 'teacher', 'student'],
            required: true,
            index: true,
        },
        // Optional for teachers only. Unique & sparse so only teachers will have it.
        facultyId: {
            type: String,
            unique: true,
            sparse: true,
            match: /^FID\d{5}$/, // FID00001
        },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
