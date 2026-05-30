import { Request, Response, NextFunction } from "express";
import { TokenService } from "../Middleware/JwtConfig/GetJwtToken";

export interface AuthRequest extends Request {
  user?: any;
}

export class TokenAuth {
  private static instance: TokenAuth;
  private tokenService: TokenService

  private constructor() {
    this.tokenService = TokenService.getInstance();
  }

  public static getInstance(): TokenAuth {
    if (!TokenAuth.instance) {
      TokenAuth.instance = new TokenAuth();
    }
    return TokenAuth.instance;
  }

  public async authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    const accessToken = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN
    const refreshToken = req.headers["x-refresh-token"] as string;

    if (!accessToken || !refreshToken) {
      return res.status(401).json({
        error: "Tokens are required",
      });
    }

    // Verify tokens
    const result = await this.tokenService.verifyBothTokens(accessToken, refreshToken);

    if (!result.valid) {
      return res.status(401).json({
        error: "Invalid or expired tokens",
      });
    }

    // Attach user data to request
    req.user = result.decoded;
    next();
  }
}