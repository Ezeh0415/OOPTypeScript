export class Config {
    private static instance: Config;
    private _port: number;

    private constructor() {
        const port = process.env.PORT ? Number(process.env.PORT) : 3000;
        this._port = Number.isNaN(port) ? 3000 : port;
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
}

export default Config.getInstance();