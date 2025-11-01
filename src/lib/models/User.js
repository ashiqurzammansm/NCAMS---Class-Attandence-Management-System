import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['super_admin','institute_admin','department_admin','teacher','student'], required: true },
    passwordHash: { type: String, required: true }
},{ timestamps:true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
