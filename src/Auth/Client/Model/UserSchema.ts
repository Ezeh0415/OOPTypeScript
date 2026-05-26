import { Schema, Document, model } from 'mongoose';


export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    status: string;
    otp: string;
    otpExpiry: Date;
    otpAdded: boolean;
    loginFailedCount: number;
    lockedUntil: Date | null;
    refreshToken: string;
}



const UserSchema = new Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, required: true, default: 'user' },
        status: { type: String, required: true, default: 'active' },
        otp: { type: String, required: false },
        otpExpiry: { type: Date, required: false },
        otpAdded: { type: Boolean, required: false, default: false },
        loginFailedCount: { type: Number, required: false, default: 0 },
        lockedUntil: { type: Date, required: false },
        refreshToken: { type: String, required: false },
    },
    {
        timestamps: true
    }
)

export const UserModel = model<IUser>('Users', UserSchema);