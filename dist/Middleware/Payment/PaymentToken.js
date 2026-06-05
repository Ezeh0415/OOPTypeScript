"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentToken = void 0;
const axios_1 = __importDefault(require("axios"));
const DevConfig_1 = require("../../Config/DevConfig");
class PaymentToken {
    constructor() {
        this.config = DevConfig_1.Config.getInstance();
    }
    static getInstance() {
        if (!PaymentToken.instance) {
            PaymentToken.instance = new PaymentToken();
        }
        return PaymentToken.instance;
    }
    async flutterToken() {
        // ✅ Verify config exists
        if (!this.config.FLUTTER_PUBLIC_KEY) {
            console.error('FLUTTER_PUBLIC_KEY is missing');
        }
        try {
            // ✅ Use URLSearchParams for x-www-form-urlencoded
            const params = new URLSearchParams();
            params.append('client_id', this.config.FLUTTER_PUBLIC_KEY);
            params.append('client_secret', this.config.FLUTTER_SECRET_KEY);
            params.append('grant_type', 'client_credentials');
            const response = await axios_1.default.post('https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token', params, // ✅ Send as URLSearchParams, not JSON
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return response.data.access_token;
        }
        catch (error) {
            console.error('Failed to get Flutterwave token:', error);
            throw new Error('Unable to authenticate with Flutterwave');
        }
    }
}
exports.PaymentToken = PaymentToken;
