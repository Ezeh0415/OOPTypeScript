"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenAuth = void 0;
const GetJwtToken_1 = require("../Middleware/JwtConfig/GetJwtToken");
class TokenAuth {
    constructor() {
        this.tokenService = GetJwtToken_1.TokenService.getInstance();
    }
    static getInstance() {
        if (!TokenAuth.instance) {
            TokenAuth.instance = new TokenAuth();
        }
        return TokenAuth.instance;
    }
    async authenticate(req, res, next) {
        const accessToken = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN
        const refreshToken = req.headers["x-refresh-token"];
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
exports.TokenAuth = TokenAuth;
