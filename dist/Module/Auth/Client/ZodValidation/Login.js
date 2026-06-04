"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = void 0;
const zod_1 = require("zod");
exports.Login = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format").toLowerCase(),
    password: zod_1.z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
});
