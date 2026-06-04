"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const otp_generator_1 = require("otp-generator");
class OtpService {
    constructor() { }
    static getInstance() {
        if (!OtpService.instance) {
            OtpService.instance = new OtpService();
        }
        return OtpService.instance;
    }
    async NewOtp(number) {
        const otp = (0, otp_generator_1.generate)(number, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });
        return otp;
    }
}
exports.OtpService = OtpService;
exports.default = OtpService.getInstance();
