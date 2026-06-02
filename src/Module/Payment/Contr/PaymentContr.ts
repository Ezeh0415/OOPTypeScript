import { Response } from "express";
import { AuthRequest } from "../../../Config/JWTAUth";
import { ErrorHandler } from "../../../Utils/ZodError/ZodError";
import { createPayment } from "../ZodValidtion/paystack/CreatePayment";
import { PaymentService } from "../Service/PaymentService";
import { success } from "zod";

export class PaymentContr {
    private static instance: PaymentContr;
    private paymentService = PaymentService.getInstance();

    private constructor() { }

    public static getInstance(): PaymentContr {
        if (!PaymentContr.instance) {
            PaymentContr.instance = new PaymentContr();
        }
        return PaymentContr.instance;
    }

    async CreatePayment(req: AuthRequest, res: Response): Promise<void> {
        try {
            const validateData = createPayment.parse(req.body);
            const userId = req.user?.userId

            const userData = {
                amount: validateData.amount,
                userId: userId,
            };

            const result = await this.paymentService.CreatePayment(userData);

            res.status(200).json({
                success: true,
                message: "deposit creation success",
                result: result
            })
            
        } catch (error) {

            if (ErrorHandler.handleZodError(res, error)) {
                return;
            }
            const errorMessage = error instanceof Error ? error.message : String(error);

            res.status(500).json({
                success: false,
                message: 'internal server error',
                error: errorMessage,
            })

            return;
        }
    }
}