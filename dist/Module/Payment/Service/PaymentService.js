"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const UserSchema_1 = require("../../Auth/Client/Model/UserSchema");
const DevConfig_1 = require("../../../Config/DevConfig");
const PaymentSchema_1 = require("../Model/PaymentSchema");
const axios_1 = __importDefault(require("axios"));
const PaymentToken_1 = require("../../../Middleware/Payment/PaymentToken");
const crypto = require('crypto');
class PaymentService {
    constructor() {
        this.user = UserSchema_1.UserModel;
        this.paymentModel = PaymentSchema_1.PaymentModel;
        this.flutterToken = PaymentToken_1.PaymentToken.getInstance();
        this.config = DevConfig_1.Config.getInstance();
    }
    static getInstance() {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService();
        }
        return PaymentService.instance;
    }
    async isUserExists(userId) {
        try {
            const user = await this.user.findById(userId);
            return user;
        }
        catch (error) {
            throw new Error("user not found");
        }
    }
    async CreatePayment(userData) {
        const { userId, amount } = userData;
        const isExist = await this.isUserExists(userId);
        if (!isExist) {
            throw new Error('user not found');
        }
        const response = await axios_1.default.post(`${this.config.PAYSTACK_BASE_URL}/transaction/initialize`, {
            email: isExist.email,
            amount: amount * 100,
        }, {
            headers: {
                Authorization: `Bearer ${this.config.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json"
            }
        });
        if (response.status !== 200) {
            throw new Error("payment failed");
        }
        const fullName = `${isExist.firstName} ${isExist.lastName}`;
        const paymentData = {
            userId: isExist._id,
            amount: amount,
            status: PaymentSchema_1.PaymentStatus.PENDING,
            paymentType: PaymentSchema_1.PaymentType.DEPOSIT,
            provider: PaymentSchema_1.PaymentProvider.PAYSTACK,
            reference: response.data.data?.reference,
            customerEmail: isExist.email,
            customerName: fullName,
            metadata: {
                accessCode: response.data.data?.access_code,
                amountInKobo: amount * 100,
            },
            createdAt: new Date(),
            paystack: {
                reference: response.data.data?.reference,
                accessCode: response.data.data?.access_code,
                authorizationCode: response.data.data?.authorization_url,
                paidAt: new Date(),
            }
        };
        const result = await this.paymentModel.create(paymentData);
        return result;
    }
    async PaystackWebhook(returnData) {
        const { signature, body } = returnData;
        if (!signature) {
            throw new Error("No signature found in headers");
        }
        const hash = crypto.createHmac('sha512', this.config.PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(body))
            .digest('hex');
        if (hash !== signature) {
            throw new Error("unauthorized");
        }
        const event = body;
        switch (event.event) {
            case "charge.success":
                const success = await this.paymentModel.findOneAndUpdate({ reference: event.data.reference }, {
                    status: event.data.status,
                    amount: event.data.amount,
                    paystack: {
                        paidAt: new Date(),
                        authorizationCode: ""
                    }
                }, {
                    new: true, // Return the updated document (not the old one)
                    upsert: false // Don't create if not found (optional)
                });
                break;
            case "charge.failed":
                const failed = await this.paymentModel.findOneAndUpdate({ reference: event.data.reference }, {
                    status: event.data.status,
                    amount: event.data.amount,
                    paystack: {
                        paidAt: new Date(),
                        authorizationCode: ""
                    }
                }, {
                    new: true, // Return the updated document (not the old one)
                    upsert: false // Don't create if not found (optional)
                });
                if (!failed) {
                    throw new Error("Payment not found");
                }
                break;
        }
        ;
        return;
    }
}
exports.PaymentService = PaymentService;
