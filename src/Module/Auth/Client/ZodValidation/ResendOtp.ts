import { z } from "zod";

export const ResendOtp = z.object({
    email: z.string().email("Invalid email format").toLowerCase(),
});