import { Router } from "express";
import { AuthContr } from "../Auth/Client/Contr/Authentication/Auth";

const router = Router();
const authContr = AuthContr.getInstance();

//  Routes as functions
router.post("/register", (req, res) => authContr.register(req, res));
router.post("/login", (req, res) => authContr.login(req, res));
router.post("/otpVerify", (req, res) => authContr.otpValidate(req, res));
router.post("/resendOtp", (req, res) => authContr.resendOtp(req, res));
router.post("/forgotPassword", (req, res) => authContr.forgotPassword(req, res));
router.post("/resetPassword", (req, res) => authContr.resetPassword(req, res));

export default router;