import axios from "axios";
import { Config } from "../../Config/DevConfig";

export class PaymentToken {
    private static instance: PaymentToken;
    private config: Config;

    private constructor() {
        this.config = Config.getInstance();
    }

    public static getInstance(): PaymentToken {
        if (!PaymentToken.instance) {
            PaymentToken.instance = new PaymentToken();
        }

        return PaymentToken.instance;
    }

    public async flutterToken(): Promise<string> {
        // ✅ Verify config exists
        if (!this.config.FLUTTER_PUBLIC_KEY) {
            console.error('FLUTTER_PUBLIC_KEY is missing');
        }

        try {
            // ✅ Use URLSearchParams for x-www-form-urlencoded
            const params = new URLSearchParams();
            params.append('client_id', this.config.FLUTTER_PUBLIC_KEY as string);
            params.append('client_secret', this.config.FLUTTER_SECRET_KEY as string);
            params.append('grant_type', 'client_credentials');

            const response = await axios.post(
                'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token',
                params,  // ✅ Send as URLSearchParams, not JSON
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            return response.data.access_token;

        } catch (error) {
            console.error('Failed to get Flutterwave token:', error);
            throw new Error('Unable to authenticate with Flutterwave');
        }
    }
}