"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// app.ts
const Server_1 = require("./server/Server");
class Application {
    constructor() {
        this.server = new Server_1.AppServer();
    }
    async run() {
        try {
            await this.server.start();
        }
        catch (error) {
            console.error('Application failed to start:', error);
            process.exit(1);
        }
    }
}
// Bootstrap the application
const app = new Application();
app.run();
