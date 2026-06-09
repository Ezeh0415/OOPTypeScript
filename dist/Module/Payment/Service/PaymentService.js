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
        this.paymentToken = PaymentToken_1.PaymentToken.getInstance();
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
    async createTransferRecipient(userData) {
        const accessToken = await this.paymentToken.flutterToken();
        const traceId = crypto.randomUUID();
        const idempotencyKey = crypto.randomUUID();
        if (!accessToken) {
            throw new Error("token is not available");
        }
        let recipientData = null;
        try {
            // Try to create a new recipient
            const createResponse = await axios_1.default.post('https://developersandbox-api.flutterwave.com/transfers/recipients', {
                "type": "bank_ngn",
                "bank": {
                    "account_number": userData.account_number,
                    "code": userData.code,
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json', // Capitalized 'Content-Type'
                    'x-Trace-Id': traceId,
                    'X-Idempotency-Key': idempotencyKey,
                }
            });
            if (createResponse.data?.status === "success") {
                recipientData = createResponse.data.data;
            }
        }
        catch (createError) {
            // Handle creation errors (including 409 Conflict)
            if (createError.response?.status === 409) {
                console.log("Recipient already exists, searching for existing one...");
                try {
                    // Search for existing recipient
                    const searchResponse = await axios_1.default.get(`https://developersandbox-api.flutterwave.com/transfers/recipients`, {
                        params: {
                            page: 1,
                            page_size: 50 // Fetch up to 100 recipients
                        },
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    // console.log(searchResponse.data?.data?.recipients)
                    if (searchResponse.data?.status === "success" &&
                        searchResponse.data?.data?.recipients.length > 0) {
                        // Take the first matching recipient
                        const found = searchResponse.data.data.recipients.find((recipient) => {
                            return recipient.bank?.account_number === userData.account_number &&
                                recipient.bank?.code === userData.code;
                        });
                        recipientData = found;
                    }
                    else {
                        console.error("No existing recipient found despite 409 error");
                        return null;
                    }
                }
                catch (searchError) {
                    console.error("Search failed:", searchError.response?.data || searchError.message);
                    return null;
                }
            }
            else {
                // Handle other errors (400, 401, 500, etc.)
                console.error("Recipient creation failed:", createError.response?.data || createError.message);
                return null;
            }
        }
        // Build and return the result
        if (recipientData) {
            return {
                status: "success",
                message: "Recipient retrieved/created successfully",
                data: {
                    type: recipientData.type,
                    id: recipientData.id,
                    name: {
                        first: recipientData.name?.first || "",
                        last: recipientData.name?.last || ""
                    },
                    currency: recipientData.currency,
                    bank: {
                        account_number: recipientData.bank?.account_number || userData.account_number,
                        code: recipientData.bank?.code || userData.code
                    }
                },
                traceId: traceId,
                IdempotencyKey: idempotencyKey
            };
        }
        return null;
    }
    async initiateTransfer(userData) {
        const accessToken = await this.paymentToken.flutterToken();
        const user = await this.isUserExists(userData.userId);
        const existingPayment = await this.paymentModel.findOne({
            "flutterwave.idempotencyKey": userData.idempotencyKey
        });
        if (existingPayment) {
            throw new Error("Duplicate Transaction detected");
        }
        const payload = {
            action: PaymentSchema_1.TransferAction.INSTANT,
            type: PaymentSchema_1.TransferType.WALLET,
            reference: userData.reference,
            narration: userData.narration,
            payment_instruction: {
                source_currency: "NGN",
                destination_currency: "NGN",
                amount: {
                    applies_to: "destination_currency",
                    value: userData.amount
                },
                recipient_id: userData.id
            }
        };
        const response = await axios_1.default.post('https://developersandbox-api.flutterwave.com/transfers', payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Trace-Id': userData?.reference,
                'X-Idempotency-Key': userData?.idempotencyKey,
                'X-Scenario-Key': "successful"
            }
        });
        const responseData = response.data.data;
        const name = await `${responseData.recipient.name.first} ${responseData.recipient.name.last}`;
        const transferData = {
            userId: userData.userId,
            amount: responseData.amount.value,
            currency: responseData.recipient.currency,
            status: PaymentSchema_1.PaymentStatus.PENDING,
            paymentType: responseData.type,
            provider: PaymentSchema_1.PaymentProvider.FLUTTERWAVE,
            reference: responseData.reference,
            customerEmail: user?.email,
            customerName: name,
            flutterwave: {
                trfId: responseData.id,
                flutterId: responseData.recipient.id,
                idempotencyKey: userData.idempotencyKey,
                traceId: responseData.reference,
                action: PaymentSchema_1.TransferAction.INSTANT,
                sourceCurrency: responseData.source_currency,
                destinationCurrency: responseData.destination_currency,
                narration: responseData.narration,
                type: PaymentSchema_1.TransferType.BANK,
                recipient: {
                    type: PaymentSchema_1.TransferType.BANK,
                    id: responseData.recipient.id,
                    name: name,
                    currency: responseData.recipient.currency,
                    bank: {
                        account_number: responseData.recipient.bank.account_number,
                        code: responseData.recipient.bank.code
                    }
                }
            }
        };
        await this.paymentModel.create(transferData);
        return responseData;
    }
}
exports.PaymentService = PaymentService;
