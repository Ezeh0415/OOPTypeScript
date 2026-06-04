import axios from "axios";
import { Config } from "../../Config/DevConfig";

export class PaymentToken {
    private static instance: PaymentToken;
    private config: Config;

    private constructor() {
        this.config = Config.getInstance();
    }

    public static getInstance(): PaymentToken {
        if (PaymentToken.instance) {
            PaymentToken.instance = new PaymentToken();
        }

        return PaymentToken.instance;
    }

    public async flutterToken() {
        const token = await axios.post('https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token',
            {
                client_id: `${this.config.FLUTTER_PUBLIC_KEY as string}`,
                client_secret: `${this.config.FLUTTER_SECRET_KEY as string}`,
                grant_type: "client_credentials"
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )

        return token.data.access_token;
    }
}