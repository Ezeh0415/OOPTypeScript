"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentContr = void 0;
const ZodError_1 = require("../../../Utils/ZodError/ZodError");
const CreatePayment_1 = require("../ZodValidtion/CreatePayment");
const PaymentService_1 = require("../Service/PaymentService");
class PaymentContr {
    constructor() {
        this.paymentService = PaymentService_1.PaymentService.getInstance();
        this.createdTransfer = new Map();
    }
    static getInstance() {
        if (!PaymentContr.instance) {
            PaymentContr.instance = new PaymentContr();
        }
        return PaymentContr.instance;
    }
    async CreatePayment(req, res) {
        try {
            const validateData = CreatePayment_1.createPayment.parse(req.body);
            const userId = req.user?.userId;
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
            });
        }
        catch (error) {
            if (ZodError_1.ErrorHandler.handleZodError(res, error)) {
                return;
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            res.status(500).json({
                success: false,
                message: 'internal server error',
                error: errorMessage,
            });
            return;
        }
    }
    async PaystackWebhhok(req, res) {
        try {
            const resultData = {
                signature: req.headers['x-paystack-signature'],
                body: req.body
            };
            await this.paymentService.PaystackWebhook(resultData);
            res.status(200).send('payment successful');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            res.status(500).json({
                success: false,
                message: 'internal server error',
                error: errorMessage,
            });
            return;
        }
    }
    async createTransferRecipient(req, res) {
        try {
            const validateData = CreatePayment_1.initTransfer.parse(req.body);
            const result = await this.paymentService.createTransferRecipient(validateData);
            const userId = req.user?.userId;
            this.createdTransfer.set(userId, result);
            res.status(200).json({
                message: "transfer payment initialize",
                name: result?.data.name,
                bank: result?.data.bank
            });
        }
        catch (error) {
            if (ZodError_1.ErrorHandler.handleZodError(res, error)) {
                return;
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            res.status(500).json({
                success: false,
                message: 'internal server error',
                error: errorMessage,
            });
            return;
        }
    }
    async initiateTransfer(req, res) {
        try {
            const validateData = await CreatePayment_1.initPayment.parse(req.body);
            const userId = req.user?.userId;
            const recipientData = this.createdTransfer.get(userId);
            if (!recipientData) {
                res.status(404).json({
                    message: "error fetching recipent"
                });
            }
            const userData = {
                userId: userId,
                amount: validateData.amount,
                narration: validateData.narration,
                id: recipientData.data.id,
                reference: recipientData.traceId,
                idempotencyKey: recipientData.IdempotencyKey
            };
            const result = await this.paymentService.initiateTransfer(userData);
            res.status(200).json({
                status: true,
                message: "transfer status pending",
                result: result
            });
        }
        catch (error) {
            if (ZodError_1.ErrorHandler.handleZodError(res, error)) {
                return;
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            res.status(500).json({
                success: false,
                message: 'internal server error',
                error: errorMessage,
            });
            return;
        }
    }
    async flutterWaveWebhook(req, res) {
        try {
            const response = req.body;
            // console.log(response);
            await this.paymentService.flutterWebhook(response);
            res.status(200).json({
                message: `Transfer Payment${response.data.status}`
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            res.status(500).json({
                success: false,
                message: 'internal server error',
                error: errorMessage,
            });
            return;
        }
    }
}
exports.PaymentContr = PaymentContr;
