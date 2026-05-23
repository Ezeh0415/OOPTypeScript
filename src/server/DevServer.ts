import express from 'express';
import { DevMiddlewareConfig } from './DevMiddleware';
import { Config } from '../Config/DevConfig';
import { DevDatabase } from '../Config/DevDatabase';
import { Server as HttpsServer } from "http";

export class DevServer {
    private app: express.Application;
    private server?: HttpsServer;
    private config: Config;
    private database: DevDatabase;
    private middlewareConfig: DevMiddlewareConfig;

    constructor() {
        this.app = express();
        this.config = Config.getInstance();
        this.database = DevDatabase.getInstance();
        this.middlewareConfig = new DevMiddlewareConfig(this.app);
    }

    public async initialize(): Promise<void> {
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

        } catch (error) {
            console.error(' Server initialization failed:', error);
            throw error;
        }

    }

    public async start(): Promise<void> {
        try {
            await this.initialize();

            this.server = this.app.listen(this.config.port, () => {
                console.log(`server started successfully on port ${this.config.port}`);
            });

        } catch (error) {
            console.error(' Failed to start server:', error);
            process.exit(1);
        }
    }

}