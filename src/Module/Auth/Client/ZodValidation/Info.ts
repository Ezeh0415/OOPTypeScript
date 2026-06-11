import z from "zod";

export const userInfo = z.object({
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
    line1: z.string().min(1, "Address line 1 is required"),
    line2: z.string().optional(),
    postalCode: z.number().int("Must be a whole number").positive("Must be positive"),
    state: z.string().min(1, "State is required"),
    countryCode: z.string().length(2, "Must be 2 characters (e.g., NG, US)"),
    number: z.number().int("Must be a whole number").positive("Must be positive")
});