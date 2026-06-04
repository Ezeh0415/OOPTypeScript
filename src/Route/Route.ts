import { Router } from "express";
import express from 'express';
import passport, { passportConfigure } from "../Middleware/Passport.ts/Passport";
import { TokenAuth } from "../Config/JWTAUth";
import { AuthContr } from "../Module/Auth/Client/Contr/Authentication/Auth";
import { PaymentContr } from "../Module/Payment/Contr/PaymentContr";

const router = Router();
const authContr = AuthContr.getInstance();
const paymentContr = PaymentContr.getInstance();
const Authentication = TokenAuth.getInstance();
// Initialize passport strategy first
passportConfigure["passport.use"]();

//  Routes as functions
// register route
router.post("/register", (req, res) => authContr.register(req, res));
router.post("/login", (req, res) => authContr.login(req, res));
router.post("/otpVerify", (req, res) => authContr.otpValidate(req, res));
router.post("/resendOtp", (req, res) => authContr.resendOtp(req, res));
router.post("/forgotPassword", (req, res) => authContr.forgotPassword(req, res));
router.post("/resetPassword", (req, res) => authContr.resetPassword(req, res));


// Google Auth Route - Redirect to Google
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

router.get("/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login",
        session: false
    }),
    (req, res, next) => authContr.googleRegister(req, res, next)
)

// payment section 

router.post('/paystack/deposit',
    Authentication.authenticate.bind(Authentication),
    (req, res) => paymentContr.CreatePayment(req, res)
)

router.post('/deposit/webhook',
    express.json(),
    (req, res) => paymentContr.PaystackWebhhok(req, res)
)


export default router;