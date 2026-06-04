"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpValidation = void 0;
const zod_1 = require("zod");
exports.OtpValidation = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format").toLowerCase(),
    otp: zod_1.z.string()
});
