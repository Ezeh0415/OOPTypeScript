"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const DevConfig_1 = require("../../Config/DevConfig");
class TokenService {
    constructor() {
        this.config = DevConfig_1.Config.getInstance(); // Get instance, not the class
    }
    static getInstance() {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
        }
        return TokenService.instance;
    }
    async getJwtToken(userId, email) {
        const jwtKey = this.config.JWT_TOKEN_KEY; // Use instance property
        if (!jwtKey) {
            throw new Error("JWT_TOKEN_KEY is not defined");
        }
        const expiresIn = this.config.JWT_TOKEN_EXPIRE ?? "7d";
        const token = jsonwebtoken_1.default.sign({ userId, email }, jwtKey, { expiresIn: expiresIn });
        return token;
    }
    async getRefreshJwtToken(userId, email) {
        const jwtKey = this.config.JWT_REFRESH_TOKEN_KEY;
        if (!jwtKey) {
            throw new Error("JWT_REFRESH_TOKEN_KEY is not defined");
        }
        const expiresIn = this.config.JWT_REFRESH_TOKEN_EXPIRE ?? "7d";
        const token = jsonwebtoken_1.default.sign({ userId, email }, jwtKey, { expiresIn: expiresIn });
        return token;
    }
    async verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.config.JWT_TOKEN_KEY);
            return { valid: true, decoded };
        }
        catch (error) {
            return { valid: false };
        }
    }
    async verifyBothTokens(accessToken, refreshToken) {
        // Try access token first
        try {
            const decoded = jsonwebtoken_1.default.verify(accessToken, this.config.JWT_TOKEN_KEY);
            return { valid: true, decoded };
        }
        catch (accessError) {
            // Access token failed, try refresh token
            try {
                const decoded = jsonwebtoken_1.default.verify(refreshToken, this.config.JWT_REFRESH_TOKEN_KEY);
                // Refresh token is valid, but access token expired
                return {
                    valid: true,
                    decoded,
                    needsNewAccessToken: true
                };
            }
            catch (refreshError) {
                // Both tokens are invalid
                return { valid: false };
            }
        }
    }
}
exports.TokenService = TokenService;
exports.default = TokenService.getInstance();
