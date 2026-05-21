export class AppConfig {
    private static instance: AppConfig;
    private _port: number;

    private constructor() {
        this._port = 3000;
    }

    public static getInstance(): AppConfig {
        if (!AppConfig.instance) {
            AppConfig.instance = new AppConfig();
        }
        return AppConfig.instance;
    }

    public get port(): number {
        return this._port;
    }

}

export default AppConfig.getInstance();