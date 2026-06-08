import z from "zod";

export const createPayment = z.object({
    amount: z.number()
});

export const initTransfer = z.object({
    account_number: z.string(),
    code: z.string()
});

export const initPayment = z.object({
    amount:z.number(),
    narration:z.string()
})