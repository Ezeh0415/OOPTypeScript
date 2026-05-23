import jwt from "jsonwebtoken";




export class TokenService {
    private static instance: TokenService;

    private constructor() {}

    public static getInstance(): TokenService {
        if(!TokenService.instance) {
            TokenService.instance = new TokenService();
        }

        return TokenService.instance;
    }
}
