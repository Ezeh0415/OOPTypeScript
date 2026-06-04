"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
class Config {
    constructor() {
        const port = Number.parseInt(process.env.PORT ?? '3000', 10);
        this._port = Number.isNaN(port) ? 3000 : port;
        this._SESSION_SECRET = process.env.SESSION_SECRET ?? '';
        this._GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
        this._GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';
        this._PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY ?? '';
        this._PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY ?? '';
        this._PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL ?? '';
        this._JWT_TOKEN_KEY = process.env.JWT_TOKEN_KEY ?? '';
        this._JWT_REFRESH_TOKEN_KEY = process.env.JWT_REFRESH_TOKEN_KEY ?? '';
        this._JWT_TOKEN_EXPIRE = process.env.JWT_TOKEN_EXPIRE ?? '';
        this._JWT_REFRESH_TOKEN_EXPIRE = process.env.JWT_REFRESH_TOKEN_EXPIRE ?? '';
        this._FLUTTER_SECRET_KEY = process.env.FLUTTER_SECRET_KEY ?? '';
        this._FLUTTER_PUBLIC_KEY = process.env.FLUTTER_PUBLIC_KEY ?? '';
        this._FLUTTER_ENCRYPTION_KEY = process.env.FLUTTER_ENCRYPTION_KEY ?? '';
        this._FLUTTER_SECRET_HASH = process.env.FLUTTER_SECRET_HASH ?? '';
    }
    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
    get port() {
        return this._port;
    }
    get JWT_TOKEN_KEY() {
        return this._JWT_TOKEN_KEY;
    }
    get JWT_REFRESH_TOKEN_KEY() {
        return this._JWT_REFRESH_TOKEN_KEY;
    }
    get JWT_TOKEN_EXPIRE() {
        return this._JWT_TOKEN_EXPIRE;
    }
    get JWT_REFRESH_TOKEN_EXPIRE() {
        return this._JWT_REFRESH_TOKEN_EXPIRE;
    }
    get SESSION_SECRET() {
        return this._SESSION_SECRET;
    }
    get GOOGLE_CLIENT_ID() {
        return this._GOOGLE_CLIENT_ID;
    }
    get GOOGLE_CLIENT_SECRET() {
        return this._GOOGLE_CLIENT_SECRET;
    }
    get PAYSTACK_SECRET_KEY() {
        return this._PAYSTACK_SECRET_KEY;
    }
    get PAYSTACK_PUBLIC_KEY() {
        return this._PAYSTACK_PUBLIC_KEY;
    }
    get PAYSTACK_BASE_URL() {
        return this._PAYSTACK_BASE_URL;
    }
    get FLUTTER_SECRET_KEY() {
        return this._FLUTTER_SECRET_KEY;
    }
    get FLUTTER_PUBLIC_KEY() {
        return this._FLUTTER_PUBLIC_KEY;
    }
    get FLUTTER_ENCRYPTION_KEY() {
        return this._FLUTTER_ENCRYPTION_KEY;
    }
    get FLUTTER_SECRET_HASH() {
        return this._FLUTTER_SECRET_HASH;
    }
}
exports.Config = Config;
exports.default = Config.getInstance();
