import { Router } from "express";
import { AuthContr } from "../Auth/Client/Contr/Authentication/Auth";

const router = Router();
const authContr = AuthContr.getInstance();

// ✅ Routes as functions
router.post("/register", (req, res) => authContr.register(req, res));

export default router;