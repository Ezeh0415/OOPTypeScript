export class Config {
    private static instance: Config;
    private _port: number;
    private _JWT_TOKEN_KEY: string;
    private _JWT_REFRESH_TOKEN_KEY: string;
    private _JWT_TOKEN_EXPIRE: string;
    private _JWT_REFRESH_TOKEN_EXPIRE: string;
    private _SESSION_SECRET: string;
    private _GOOGLE_CLIENT_ID: string;
    private _GOOGLE_CLIENT_SECRET: string;
    private _PAYSTACK_SECRET_KEY: string;
    private _PAYSTACK_PUBLIC_KEY: string;
    private _PAYSTACK_BASE_URL: string;

    private constructor() {
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
    }

    public static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }


    public get port(): number {
        return this._port;
    }

    public get JWT_TOKEN_KEY(): string {
        return this._JWT_TOKEN_KEY;
    }

    public get JWT_REFRESH_TOKEN_KEY(): string {
        return this._JWT_REFRESH_TOKEN_KEY;
    }

    public get JWT_TOKEN_EXPIRE(): string {
        return this._JWT_TOKEN_EXPIRE;
    }

    public get JWT_REFRESH_TOKEN_EXPIRE(): string {
        return this._JWT_REFRESH_TOKEN_EXPIRE;
    }

    public get SESSION_SECRET(): string {
        return this._SESSION_SECRET
    }

    public get GOOGLE_CLIENT_ID(): string {
        return this._GOOGLE_CLIENT_ID;
    }

    public get GOOGLE_CLIENT_SECRET(): string {
        return this._GOOGLE_CLIENT_SECRET;
    }

    public get PAYSTACK_SECRET_KEY(): string {
        return this._PAYSTACK_SECRET_KEY;
    }

    public get PAYSTACK_PUBLIC_KEY(): string {
        return this._PAYSTACK_PUBLIC_KEY;
    }

    public get PAYSTACK_BASE_URL(): string {
        return this._PAYSTACK_BASE_URL;
    }
}

export default Config.getInstance();