"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const Passport_1 = __importStar(require("../Middleware/Passport.ts/Passport"));
const JWTAUth_1 = require("../Config/JWTAUth");
const Auth_1 = require("../Module/Auth/Client/Contr/Authentication/Auth");
const PaymentContr_1 = require("../Module/Payment/Contr/PaymentContr");
const router = (0, express_1.Router)();
const authContr = Auth_1.AuthContr.getInstance();
const paymentContr = PaymentContr_1.PaymentContr.getInstance();
const Authentication = JWTAUth_1.TokenAuth.getInstance();
// Initialize passport strategy first
Passport_1.passportConfigure["passport.use"]();
//  Routes as functions
// register route
router.post("/register", (req, res) => authContr.register(req, res));
router.post("/login", (req, res) => authContr.login(req, res));
router.post("/otpVerify", (req, res) => authContr.otpValidate(req, res));
router.post("/resendOtp", (req, res) => authContr.resendOtp(req, res));
router.post("/forgotPassword", (req, res) => authContr.forgotPassword(req, res));
router.post("/resetPassword", (req, res) => authContr.resetPassword(req, res));
// user info 
router.post("/userInfo", Authentication.authenticate.bind(Authentication), (req, res) => authContr.userInfo(req, res));
// Google Auth Route - Redirect to Google
router.get('/google', Passport_1.default.authenticate('google', {
    scope: ['profile', 'email']
}));
router.get("/google/callback", Passport_1.default.authenticate("google", {
    failureRedirect: "/login",
    session: false
}), (req, res, next) => authContr.googleRegister(req, res, next));
// payment section 
router.post('/paystack/deposit', Authentication.authenticate.bind(Authentication), (req, res) => paymentContr.CreatePayment(req, res));
router.post('/deposit/webhook', express_2.default.json(), (req, res) => paymentContr.PaystackWebhhok(req, res));
router.post('/flutterWave/transfer', Authentication.authenticate.bind(Authentication), (req, res) => paymentContr.createTransferRecipient(req, res));
router.post('/flutterWave/initiateTransfer', Authentication.authenticate.bind(Authentication), (req, res) => paymentContr.initiateTransfer(req, res));
router.post('/webhook/transfer-callback', (req, res) => paymentContr.flutterWaveWebhook(req, res));
exports.default = router;
