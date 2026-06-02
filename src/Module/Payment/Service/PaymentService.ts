import { email } from "zod";
import { IUser, UserModel } from "../../Auth/Client/Model/UserSchema";
import { Config } from "../../../Config/DevConfig";
import { PaymentModel, PaymentProvider, PaymentStatus, PaymentType } from "../Model/PaymentSchema";
import axios from "axios";


export class PaymentService {
    private static instance: PaymentService;
    private config: Config;
    private user = UserModel;
    private paymentModel = PaymentModel;

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

        console.log(paymentData)
    }
}