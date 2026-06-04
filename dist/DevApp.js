"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DevServer_1 = require("./server/DevServer");
class DevApplication {
    constructor() {
        this.server = new DevServer_1.DevServer();
    }
    async run() {
        try {
            await this.server.start();
        }
        catch (error) {
            console.error('DevApplication failed to start:', error);
            process.exit(1);
        }
    }
}
// Bootstrap the application
const app = new DevApplication();
app.run();
