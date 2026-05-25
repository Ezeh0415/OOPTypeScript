import jwt from "jsonwebtoken";




export class TokenService {
    private static instance: TokenService;

    private constructor() { }

    public static getInstance(): TokenService {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
        }

        return TokenService.instance;
    }


    public async getJwtToken(userId: object, email: string): Promise<string> {
        const jwtKey = process.env.JWT_TOKEN_KEY;
        if (!jwtKey) {
            throw new Error("JWT_TOKEN_KEY is not defined");
        }

        const expiresIn = process.env.JWT_TOKEN_EXPIRE ?? "7d";
        const token = jwt.sign(
            { userId, email },
            jwtKey as jwt.Secret,
            { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] }
        );

        return token;
    }
    public async getRefreshJwtToken(userId: object, email: string): Promise<string> {
        const jwtKey = process.env.JWT_REFRESH_TOKEN_KEY;
        if (!jwtKey) {
            throw new Error("JWT_REFRESH_TOKEN_KEY is not defined");
        }

        const expiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRE ?? "7d";
        const token = jwt.sign(
            { userId, email },
            jwtKey as jwt.Secret,
            { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] }
        );

        return token;
    }
}

export default TokenService.getInstance();