import { generate } from "otp-generator";

export class OtpService {
    private static instance: OtpService;

    private constructor() { }

    public static getInstance(): OtpService {
        if (!OtpService.instance) {
            OtpService.instance = new OtpService();
        }

        return OtpService.instance;
    }

    async NewOtp(number: number): Promise<string> {
        const otp = generate(number, {
            digits: true,
            lowerCaseAlphabets: true,
            upperCaseAlphabets: false,
            specialChars: false,
        });
        return otp;
    }
}

export default OtpService.getInstance();