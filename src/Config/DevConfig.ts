export class Config {
    private static instance: Config;
    private _port: number;

    private constructor() {
        this._port = 3000;
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