"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const GetJwtToken_1 = require("../../../../../Middleware/JwtConfig/GetJwtToken");
const OtpGenerate_1 = require("../../../../../Utils/GenerateOtp/OtpGenerate");
const UserSchema_1 = require("../../Model/UserSchema");
const bcryptJs_1 = __importDefault(require("bcryptJs"));
class AuthService {
    constructor() {
        this.user = UserSchema_1.UserModel;
        this.SALT_ROUNDS = 10;
        this.tokenService = GetJwtToken_1.TokenService.getInstance();
        this.otpService = OtpGenerate_1.OtpService.getInstance();
    }
    static getInstance() {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }
    async isUserExists(email) {
        try {
            const user = await this.user.findOne({ email });
            return user;
        }
        catch (error) {
            console.error('Error checking user existence:', error);
            return null;
        }
    }
    async register(userData) {
        const email = userData?.email;
        const existingUser = await this.isUserExists(email);
        if (existingUser) {
            throw new Error("user already exists");
        }
        // otp 
        const number = 6;
        const otp = await this.otpService.NewOtp(number);
        // Hash password
        const hashedPassword = await bcryptJs_1.default.hash(userData.password, this.SALT_ROUNDS);
        const newUser = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: hashedPassword,
            otp: otp,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
        };
        const user = new this.user(newUser);
        user.save();
        return user;
    }
    async login(userData) {
        const email = userData.email;
        const isExist = await this.isUserExists(email);
        if (!isExist) {
            throw new Error("user dose not exist ");
        }
        if (isExist.lockedUntil && isExist.lockedUntil > new Date()) {
            const remainingMinutes = Math.ceil((isExist.lockedUntil.getTime() - Date.now()) / 60000);
            throw new Error(`Account is locked. Please try again in ${remainingMinutes} minutes`);
        }
        if (isExist.loginFailedCount >= 5) {
            isExist.lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // Lock for 10 minutes
            isExist.loginFailedCount = 0; //lock count reset
            await isExist.save();
            throw new Error(`Too many failed attempts. Account locked until ${isExist.lockedUntil}`);
        }
        const password = userData.password;
        const dbPassword = isExist?.password;
        const isPasswordValid = await bcryptJs_1.default.compare(password, dbPassword);
        if (!isPasswordValid) {
            isExist.loginFailedCount = (isExist.loginFailedCount || 0) + 1;
            isExist.save();
            throw new Error("password does not match");
        }
        const token = await this.tokenService.getRefreshJwtToken(isExist?._id, isExist?.email);
        isExist.refreshToken = token;
        isExist.loginFailedCount = 0; //lock count reset
        isExist.save();
        return isExist;
    }
    async otpValidate(userData) {
        const email = userData.email;
        const otp = userData.otp;
        const isExist = await this.isUserExists(email);
        if (!isExist) {
            throw new Error('error user not found');
        }
        const otpExpiry = isExist.otpExpiry ? new Date(isExist.otpExpiry) : null;
        const currentTime = new Date();
        if (!otpExpiry || otpExpiry < currentTime) {
            await this.user.updateOne({ _id: isExist._id }, { $set: { otp: "", otpExpiry: "", otpAdded: false } });
            throw new Error('OTP has expired');
        }
        if (!otp || isExist.otp !== otp) {
            await this.user.updateOne({ _id: isExist._id }, { $set: { otp: "", otpExpiry: "", otpAdded: false } });
            throw new Error('invalid otp');
        }
        await this.user.updateOne({ _id: isExist._id }, { $set: { otp: "", otpExpiry: "", otpAdded: true } });
        return true;
    }
    async resendOtp(email) {
        const isExist = await this.isUserExists(email);
        if (!isExist) {
            throw new Error("user not found ");
        }
        const newOtp = await this.otpService.NewOtp(6);
        if (!newOtp) {
            throw new Error("otp error");
        }
        await this.user.updateOne({ _id: isExist._id }, { $set: { otp: newOtp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000), otpAdded: false } });
        return true;
    }
    async ForgotPassword(email) {
        const isExist = await this.isUserExists(email);
        if (!isExist) {
            throw new Error("check your email nd try again");
        }
        const newOtp = await this.otpService.NewOtp(6);
        await this.user.updateOne({ _id: isExist._id }, { $set: { otp: newOtp, otpAdded: false, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) } });
        // setup email and send token 
        return true;
    }
    async resetPassword(userData) {
        const { email, password, otp } = userData;
        const user = await this.isUserExists(email);
        if (!user) {
            throw new Error("user not found");
        }
        // 1. Verify OTP first (usually cheaper than bcrypt)
        if (user.otp !== otp) {
            throw new Error("invalid otp");
        }
        // 2. Check if new password is same as old password
        const isSameAsOld = await bcryptJs_1.default.compare(password, user.password);
        if (isSameAsOld) {
            throw new Error("new password cannot be the same as old password");
        }
        // 3. Hash the new password
        const hashPassword = await bcryptJs_1.default.hash(password, this.SALT_ROUNDS);
        // 4. Update user
        await this.user.updateOne({ _id: user._id }, { $set: { password: hashPassword, otp: "", otpAdded: true, otpExpiry: "" } });
        return true;
    }
    async googleRegister(userData) {
        const isExist = await this.isUserExists(userData.email);
        if (!isExist) {
            throw new Error("user not found ");
        }
        const id = isExist?._id;
        const email = isExist?.email;
        const refreshToken = await this.tokenService.getJwtToken(id, email);
        isExist.refreshToken = refreshToken;
        isExist.save();
        return isExist;
    }
    async userInfo(userData) {
        const updateUserInfo = await this.user.updateOne({ _id: userData.userId }, {
            $set: {
                address: {
                    city: userData.city,
                    country: userData.country,
                    line1: userData.line1,
                    line2: userData.line2 || "",
                    postal_code: userData.postalCode,
                    state: userData.state
                },
                phone: {
                    country_code: userData.countryCode,
                    number: userData.number
                }
            }
        });
        // Check if user exists
        if (updateUserInfo.matchedCount === 0) {
            throw new Error('User not found');
        }
        // Check if address was updated
        if (updateUserInfo.modifiedCount === 0) {
            // Address might be the same as before
            throw new Error('Address already up to date or no changes made');
        }
        return true;
    }
}
exports.AuthService = AuthService;
