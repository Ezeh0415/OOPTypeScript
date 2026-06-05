import { Request, Response } from "express";
import { AuthRequest } from "../../../Config/JWTAUth";
import { ErrorHandler } from "../../../Utils/ZodError/ZodError";
import { createPayment, initTransfer } from "../ZodValidtion/CreatePayment";
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
                result: {
                    amount: result.amount,
                    info: result.paystack,
                },
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

    async PaystackWebhhok(req: Request, res: Response): Promise<void> {
        try {

            const resultData = {
                signature: req.headers['x-paystack-signature'] as string,
                body: req.body
            }

            await this.paymentService.PaystackWebhook(resultData);


            res.status(200).send('payment successful');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            res.status(500).json({
                success: false,
                message: 'internal server error',
                error: errorMessage,
            })

            return;
        }
    }

    async createTransferRecipient(req: AuthRequest, res: Response): Promise<void> {
        try {
            const validateData = initTransfer.parse(req.body);

            const result = await this.paymentService.createTransferRecipient(validateData);

            res.status(200).json({
                message: "transfer payment initialize",
                result
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