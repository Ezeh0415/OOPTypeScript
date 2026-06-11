"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthContr = void 0;
const Auth_1 = require("../../Service/Authentication/Auth");
const ZodError_1 = require("../../../../../Utils/ZodError/ZodError");
const Registration_1 = require("../../ZodValidation/Registration");
const GetJwtToken_1 = require("../../../../../Middleware/JwtConfig/GetJwtToken");
const Login_1 = require("../../ZodValidation/Login");
const Otp_1 = require("../../ZodValidation/Otp");
const ResendOtp_1 = require("../../ZodValidation/ResendOtp");
const ResetPassword_1 = require("../../ZodValidation/ResetPassword");
const Info_1 = require("../../ZodValidation/Info");
class AuthContr {
    constructor() {
        this.authService = Auth_1.AuthService.getInstance();
        this.tokenService = GetJwtToken_1.TokenService.getInstance();
    }
    static getInstance() {
        if (!AuthContr.instance) {
            AuthContr.instance = new AuthContr();
        }
        return AuthContr.instance;
    }
    async register(req, res) {
        try {
            const validation = Registration_1.Register.parse(req.body);
            const user = await this.authService.register(validation);
            const userObject = user?.toObject && typeof user.toObject === 'function'
                ? user.toObject()
                : user || {};
            const { password, otp, otpExpire, otpAdded, loginFailedCount, lockedUntil, ...safeUser } = userObject;
            // Now safeUser has all fields EXCEPT password
            res.status(201).json({
                success: true,
                message: "user registered successfully",
                user: safeUser,
            });
        }
        catch (error) {
            if (ZodError_1.ErrorHandler.handleZodError(res, error)) {
                return;
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            res.status(500).json({
                success: false,
                message: 'internal server error',
                error: errorMessage,
            });
            return;
        }
    }
    async login(req, res) {
        try {
            const validateData = Login_1.Login.parse(req.body);
            const user = await this.authService.login(validateData);
            const token = await this.tokenService.getJwtToken(user?._id, user?.email);
            const userObject = user?.toObject && typeof user.toObject === 'function'
                ? user.toObject()
                : user || {};
            const { password, otp, otpExpire, otpAdded, loginFailedCount, lockedUntil, ...safeUser } = userObject;
            // Now safeUser has all fields EXCEPT password
            res.status(200).json({
                success: true,
                message: "user login successfully",
                safeUser,
                token
            });
            return;
        }
        catch (error) {
            if (ZodError_1.ErrorHandler.handleZodError(res, error)) {
                return;
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            res.status(500).json({
                success: false,
                message: 'internal server error',
                error: errorMessage,
            });
            return;
        }
    }
    async otpValidate(req, res) {
        try {
            const validate = await Otp_1.OtpValidation.parse(req.body);
            const verify = await this.authService.otpValidate(validate);
            res.status(200).json({ status: verify, message: "otp successfully verified" });
        }
        catch (error) {
            if (ZodError_1.ErrorHandler.handleZodError(res, error)) {
                return;
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            res.status(500).json({
                success: false,
                message: 'internal server error',
                error: errorMessage,
            });
            return;
        }
    }
    async resendOtp(req, res) {
        try {
            const validateData = await ResendOtp_1.ResendOtp.parse(req.body);
            const user = await this.authService.resendOtp(validateData.email);
            res.status(200).json({
                success: user,
                message: "otp resent successfully",
            });
        }
        catch (error) {
            if (ZodError_1.ErrorHandler.handleZodError(res, error)) {
                return;
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            res.status(500).json({
                success: false,
                message: 'internal server error',
                error: errorMessage,
            });
            return;
        }
    }
    async forgotPassword(req, res) {
        try {
            const validateData = await ResendOtp_1.ResendOtp.parse(req.body);
            const user = await this.authService.ForgotPassword(validateData.email);
            res.status(200).json({
                success: user,
                message: "order initiated"
            });
        }
        catch (error) {
            if (ZodError_1.ErrorHandler.handleZodError(res, error)) {
                return;
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            res.status(500).json({
                success: false,
                message: 'internal server error',
                error: errorMessage,
            });
        }
    }
    async resetPassword(req, res) {
        try {
            const validateData = ResetPassword_1.ResetPassword.parse(req.body);
            const user = await this.authService.resetPassword(validateData);
            res.status(200).json({
                success: user,
                message: "password reset successfully"
            });
        }
        catch (error) {
            if (ZodError_1.ErrorHandler.handleZodError(res, error)) {
                return;
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            res.status(500).json({
                status: false,
                message: "sever error",
                error: errorMessage
            });
        }
    }
    async googleRegister(req, res, next) {
        try {
            const result = req.user;
            if (!result) {
                res.status(401).json({ message: "authentication failed" });
                return;
            }
            const user = await this.authService.googleRegister(result);
            const token = await this.tokenService.getJwtToken(user._id, user.email);
            const userObject = user.toObject();
            const { password, otp, otpExpire, otpAdded, loginFailedCount, lockedUntil, ...safeUser } = userObject;
            res.status(200).json({ message: "login successful", user: safeUser, token });
            return;
        }
        catch (error) {
            next(error);
        }
    }
    async userInfo(req, res) {
        try {
            const validateData = await Info_1.userInfo.parse(req.body);
            const userId = req.user?.userId;
            const userData = {
                userId: userId,
                city: validateData.city,
                country: validateData.country,
                line1: validateData.line1,
                line2: validateData.line2,
                postalCode: validateData.postalCode,
                state: validateData.state,
                countryCode: validateData.countryCode,
                number: validateData.number
            };
            const result = await this.authService.userInfo(userData);
            res.status(200).json({
                status: result,
            });
        }
        catch (error) {
            if (ZodError_1.ErrorHandler.handleZodError(res, error)) {
                return;
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            res.status(500).json({
                status: false,
                message: "sever error",
                error: errorMessage
            });
        }
    }
}
exports.AuthContr = AuthContr;
