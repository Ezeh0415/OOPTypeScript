import { z } from "zod";

export const OtpValidation = z.object({
    email: z.string().email("Invalid email format").toLowerCase(),
    otp: z.string()
});