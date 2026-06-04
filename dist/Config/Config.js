"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfig = void 0;
class AppConfig {
    constructor() {
        this._port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    }
    static getInstance() {
        if (!AppConfig.instance) {
            AppConfig.instance = new AppConfig();
        }
        return AppConfig.instance;
    }
    get port() {
        return this._port;
    }
}
exports.AppConfig = AppConfig;
exports.default = AppConfig.getInstance();
