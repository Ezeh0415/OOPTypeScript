import z from "zod";


export const cardInfo = z.object({
    card_number: z.string(),
    expiry_month: z.string(),
    expiry_year: z.string(),
    card_cvv: z.string(),
})