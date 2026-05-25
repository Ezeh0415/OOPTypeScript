import { Request, Response } from "express";
import { AuthService } from "../../Service/Authentication/Auth";
import { ErrorHandler } from "../../../../Utils/ZodError/ZodError";
import { Register } from "../../ZodValidation/Registration";
import { TokenService } from "../../../../Middleware/JwtConfig/GetJwtToken";
import { Login } from "../../ZodValidation/Login";

export class AuthContr {
    private static instance: AuthContr;
    private authService = AuthService.getInstance();
    private tokenService = TokenService.getInstance();

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

            const token = await this.tokenService.getJwtToken(user?._id, user?.email);

            const userObject = (user as any)?.toObject && typeof (user as any).toObject === 'function'
                ? (user as any).toObject()
                : (user as any) || {};
            const { password, otp, otpExpire, otpAdded, loginFailedCount, lockedUntil, ...safeUser } = userObject;
            // Now safeUser has all fields EXCEPT password

            res.status(201).json({
                success: true,
                message: "user registered successfully",
                user: safeUser,
                token

            })
        } catch (error) {
            if (ErrorHandler.handleZodError(res, error)) {
                return;
            }

            const errorMessage = error instanceof Error ? error.message : String(error);

            res.status(500).json({
                success: false,
                message: 'internal server error',
                error: errorMessage,
            })

            return;
        }
    }

    public async login(req: Request, res: Response): Promise<void> {
        try {
            const validateData = Login.parse(req.body);

            const user = await this.authService.login(validateData);

            const token = await this.tokenService.getJwtToken(user?._id, user?.email);

            const userObject = (user as any)?.toObject && typeof (user as any).toObject === 'function'
                ? (user as any).toObject()
                : (user as any) || {};
            const { password, otp, otpExpire, otpAdded, loginFailedCount, lockedUntil, ...safeUser } = userObject;
            // Now safeUser has all fields EXCEPT password

            res.status(200).json({
                success: true,
                message: "user login successfully",
                safeUser,
                token
            })

            return;

        } catch (error) {
            if (ErrorHandler.handleZodError(res, error)) {
                return;
            }

            const errorMessage = error instanceof Error ? error.message : String(error);

            res.status(500).json({
                success: false,
                message: 'internal server error',
                error: errorMessage,
            })

            return;
        }
    }
}
