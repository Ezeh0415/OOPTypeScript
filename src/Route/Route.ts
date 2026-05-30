import { Router } from "express";
import { AuthContr } from "../Auth/Client/Contr/Authentication/Auth";
import passport, { passportConfigure } from "../Middleware/Passport.ts/Passport";
import { TokenAuth } from "../Config/JWTAUth";

const router = Router();
const authContr = AuthContr.getInstance();
const Authentication = TokenAuth.getInstance();
// Initialize passport strategy first
passportConfigure["passport.use"]();

//  Routes as functions
// register route
router.post("/register",(req, res) => authContr.register(req, res));
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


export default router;