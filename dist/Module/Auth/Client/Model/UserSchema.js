"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    googleId: { type: String, required: false },
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
}, {
    timestamps: true
});
exports.UserModel = (0, mongoose_1.model)('Users', UserSchema);
