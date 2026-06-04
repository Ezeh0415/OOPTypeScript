"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevServer = void 0;
const express_1 = __importDefault(require("express"));
const DevMiddleware_1 = require("./DevMiddleware");
const DevConfig_1 = require("../Config/DevConfig");
const DevDatabase_1 = require("../Config/DevDatabase");
class DevServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.config = DevConfig_1.Config.getInstance();
        this.database = DevDatabase_1.DevDatabase.getInstance();
        this.middlewareConfig = new DevMiddleware_1.DevMiddlewareConfig(this.app);
    }
    async initialize() {
        try {
            console.log("initializing server....");
            // configure middleware
            this.middlewareConfig.initialize();
            // configure error handler 
            // this.configureErrorHandlers();
            // connect database
            const dbConnected = await this.database.connect();
            if (!dbConnected) {
                throw new Error("Database connection failed");
            }
            console.log("server initialization complete");
        }
        catch (error) {
            console.error(' Server initialization failed:', error);
            throw error;
        }
    }
    async start() {
        try {
            await this.initialize();
            this.server = this.app.listen(this.config.port, () => {
                console.log(`server started successfully on port ${this.config.port}`);
            });
        }
        catch (error) {
            console.error(' Failed to start server:', error);
            process.exit(1);
        }
    }
}
exports.DevServer = DevServer;
