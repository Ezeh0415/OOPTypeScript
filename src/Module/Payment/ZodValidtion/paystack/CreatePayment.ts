import z from "zod";

export const createPayment = z.object({
    amount: z.number()
})