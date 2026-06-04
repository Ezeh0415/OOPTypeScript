"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Register = void 0;
const zod_1 = require("zod");
exports.Register = zod_1.z.object({
    firstName: zod_1.z.string().min(2, "First name must be at least 2 characters").max(50),
    lastName: zod_1.z.string().min(2, "Last name must be at least 2 characters").max(50),
    email: zod_1.z.string().email("Invalid email format").toLowerCase(),
    password: zod_1.z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
});
