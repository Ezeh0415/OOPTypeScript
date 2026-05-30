
import jwt from "jsonwebtoken";
import { Config } from "../../Config/DevConfig";

export class TokenService {
    private static instance: TokenService;
    private config: Config;

    private constructor() {
        this.config = Config.getInstance(); // Get instance, not the class
    }

    public static getInstance(): TokenService {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
        }
        return TokenService.instance;
    }

    public async getJwtToken(userId: object, email: string): Promise<string> {
        const jwtKey = this.config.JWT_TOKEN_KEY; // Use instance property
        if (!jwtKey) {
            throw new Error("JWT_TOKEN_KEY is not defined");
        }

        const expiresIn = this.config.JWT_TOKEN_EXPIRE ?? "7d";
        const token = jwt.sign(
            { userId, email },
            jwtKey as jwt.Secret,
            { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] }
        );

        return token;
    }

    public async getRefreshJwtToken(userId: object, email: string): Promise<string> {
        const jwtKey = this.config.JWT_REFRESH_TOKEN_KEY;
        if (!jwtKey) {
            throw new Error("JWT_REFRESH_TOKEN_KEY is not defined");
        }

        const expiresIn = this.config.JWT_REFRESH_TOKEN_EXPIRE ?? "7d";
        const token = jwt.sign(
            { userId, email },
            jwtKey as jwt.Secret,
            { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] }
        );

        return token;
    }

    public async verifyAccessToken(token: string): Promise<{ valid: boolean; decoded?: any }> {
        try {
            const decoded = jwt.verify(token, this.config.JWT_TOKEN_KEY);
            return { valid: true, decoded };
        } catch (error) {
            return { valid: false };
        }
    }


    public async verifyBothTokens(accessToken: string, refreshToken: string): Promise<{
        valid: boolean;
        decoded?: any;
        needsNewAccessToken?: boolean;
    }> {
        // Try access token first
        try {
            const decoded = jwt.verify(accessToken, this.config.JWT_TOKEN_KEY);
            return { valid: true, decoded };
        } catch (accessError) {
            // Access token failed, try refresh token
            try {
                const decoded = jwt.verify(refreshToken, this.config.JWT_REFRESH_TOKEN_KEY);
                // Refresh token is valid, but access token expired
                return {
                    valid: true,
                    decoded,
                    needsNewAccessToken: true
                };
            } catch (refreshError) {
                // Both tokens are invalid
                return { valid: false };
            }
        }
    }
}

export default TokenService.getInstance();