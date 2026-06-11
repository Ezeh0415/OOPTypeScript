import { Schema, Document, model } from 'mongoose';

interface IAddress {
    city: string;
    country: string;
    line1: string;
    line2: string;
    postal_code: number | string;
    state: string;
}

interface IPhone {
    country_code: number | string;
    number: number | string;
}


export interface IUser extends Document {
    googleId: string;
    firstName: string;
    middleName: string;
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
    address?: IAddress;
    phone?: IPhone;
}



const UserSchema = new Schema(
    {
        googleId: { type: String, required: false },
        firstName: { type: String, required: true },
        middleName: { type: String, required: true },
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
        address: {
            city: { type: String },
            country: { type: String },
            line1: { type: String },
            line2: { type: String },
            postal_code: { type: Number },
            state: { type: String }
        },
        phone: {
            country_code: { type: String },
            number: { type: Number }
        }
    },
    {
        timestamps: true
    }
)

export const UserModel = model<IUser>('Users', UserSchema);