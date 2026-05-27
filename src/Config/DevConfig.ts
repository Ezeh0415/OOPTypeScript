export class Config {
    private static instance: Config;
    private _port: number;
    private _SESSION_SECRET: string;
    private _GOOGLE_CLIENT_ID: string;
    private _GOOGLE_CLIENT_SECRET: string;

    private constructor() {
        const port = Number.parseInt(process.env.PORT ?? '3000', 10);
        this._port = Number.isNaN(port) ? 3000 : port;
        this._SESSION_SECRET = process.env.SESSION_SECRET ?? '';
        this._GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
        this._GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';
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

    public get SESSION_SECRET(): string {
        return this._SESSION_SECRET
    }

    public get GOOGLE_CLIENT_ID(): string {
        return this._GOOGLE_CLIENT_ID;
    }

    public get GOOGLE_CLIENT_SECRET(): string {
        return this._GOOGLE_CLIENT_SECRET;
    }
}

export default Config.getInstance();