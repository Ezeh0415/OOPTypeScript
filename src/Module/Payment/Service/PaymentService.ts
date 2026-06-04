import { IUser, UserModel } from "../../Auth/Client/Model/UserSchema";
import { Config } from "../../../Config/DevConfig";
import { PaymentModel, PaymentProvider, PaymentStatus, PaymentType } from "../Model/PaymentSchema";
import axios from "axios";
import { IBank, IRecipient } from "../Interface/TransferRecipt";
import { PaymentToken } from "../../../Middleware/Payment/PaymentToken";
const crypto = require('crypto');


export class PaymentService {
    private static instance: PaymentService;
    private config: Config;
    private user = UserModel;
    private paymentModel = PaymentModel;
    private flutterToken = PaymentToken.getInstance();

    private constructor() {
        this.config = Config.getInstance();
    }

    public static getInstance(): PaymentService {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService();
        }
        return PaymentService.instance;
    }

    private async isUserExists(userId: string | object): Promise<IUser | null> {
        try {
            const user = await this.user.findById(userId);
            return user as IUser | null;
        } catch (error) {
            throw new Error("user not found");
        }
    }

    async CreatePayment(userData: any) {
        const { userId, amount } = userData;

        const isExist = await this.isUserExists(userId);

        if (!isExist) {
            throw new Error('user not found');
        }

        const response = await axios.post(`${this.config.PAYSTACK_BASE_URL}/transaction/initialize`,
            {
                email: isExist.email,
                amount: amount * 100,
            },
            {
                headers: {
                    Authorization: `Bearer ${this.config.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            },
        );

        if (response.status !== 200) {
            throw new Error("payment failed");
        }

        const fullName = `${isExist.firstName} ${isExist.lastName}`;


        const paymentData = {
            userId: isExist._id,
            amount: amount,
            status: PaymentStatus.PENDING,
            paymentType: PaymentType.DEPOSIT,
            provider: PaymentProvider.PAYSTACK,
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
        }

        const result = await this.paymentModel.create(paymentData);

        return result;
    }

    async PaystackWebhook(returnData: any) {
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
                const success = await this.paymentModel.findOneAndUpdate(
                    { reference: event.data.reference },
                    {
                        status: event.data.status,
                        amount: event.data.amount,
                        paystack: {
                            paidAt: new Date(),
                            authorizationCode: ""
                        }
                    },
                    {
                        new: true,  // Return the updated document (not the old one)
                        upsert: false  // Don't create if not found (optional)
                    }
                )
                break;

            case "charge.failed":
                const failed = await this.paymentModel.findOneAndUpdate(
                    { reference: event.data.reference },
                    {
                        status: event.data.status,
                        amount: event.data.amount,
                        paystack: {
                            paidAt: new Date(),
                            authorizationCode: ""
                        }
                    },
                    {
                        new: true,  // Return the updated document (not the old one)
                        upsert: false  // Don't create if not found (optional)
                    }
                );

                if (!failed) {
                    throw new Error("Payment not found");
                }


                break;
        };

        return;


    }

    // async createTransferRecipient(userData: IBank): Promise<IRecipient | null> {

    //     const accessToken = await this.flutterToken.flutterToken();
    //     const traceId = crypto.randomUUID();
    //     const idempotencyKey = crypto.randomUUID();
    //     const recipt = await axios.post('https://developersandbox-api.flutterwave.com/transfers/recipients',
            
    //         {
    //             "type": "bank_ngn",
    //             "bank": {
    //                 "account_number": userData.account_number,
    //                 "code": userData.code,
    //             }
    //         },
    //         {
    //             headers: {
    //                 'Authorization': `Bearer ${accessToken}`,
    //                 'content-type': 'application/json',
    //                 'x-Trace-Id': `${traceId}`,
    //                 'X-Idempotency-Key': `${idempotencyKey}`,

    //             }
    //         }

            
    //     )
    // }
}