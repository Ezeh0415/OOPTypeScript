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
        if (PaymentToken.instance) {
            PaymentToken.instance = new PaymentToken();
        }
        return PaymentToken.instance;
    }
    async flutterToken() {
        const token = await axios_1.default.post('https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token', {
            client_id: `${this.config.FLUTTER_PUBLIC_KEY}`,
            client_secret: `${this.config.FLUTTER_SECRET_KEY}`,
            grant_type: "client_credentials"
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return token.data.access_token;
    }
}
exports.PaymentToken = PaymentToken;
