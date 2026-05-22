import { Request, Response } from "express";
import { AuthService } from "../../Service/Authentication/Auth";
import { ErrorHandler } from "../../../../Utils/ZodError/ZodError";
import { Register } from "../../ZodValidation/Registration";

export class AuthContr {
    private static instance: AuthContr;
    private authService = AuthService.getInstance();

    private constructor() { }

    public static getInstance(): AuthContr {
        if (!AuthContr.instance) {
            AuthContr.instance = new AuthContr();
        }

        return AuthContr.instance
    }

    public async register(req: Request, res: Response): Promise<void> {
        try {
            const validation = Register.parse(req.body);

            const user = await this.authService.register(validation);

            const userObject = user.toObject();
            const { password, otp, otpExpire, otpAdded, loginFailedCount, lockedUntil, ...safeUser } = userObject;
            // Now safeUser has all fields EXCEPT password

            res.status(201).json({
                success: true,
                message: "user registered successfully",
                user: safeUser

            })
        } catch (error) {
            if (ErrorHandler.handleZodError(res, error)) {
                return;
            }
        }
    }
}
