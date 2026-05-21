import express from "express";
import { MiddlewareConfig } from "./Middleware";
import { Database } from "../Config/DataBase";
import { AppConfig } from "../Config/Config";
import { Server as HttpServer } from 'http';

export class AppServer {
    private app: express.Application;
    private server?: HttpServer;
    private config: AppConfig;
    private database: Database;
    private middlewareConfig: MiddlewareConfig;
    private isShuttingDown: boolean = false;


    constructor() {
        this.app = express();
        this.config = AppConfig.getInstance();
        this.database = Database.getInstance();
        this.middlewareConfig = new MiddlewareConfig(this.app);
    }

    public async initialize(): Promise<void> {
        try {
            console.log("initializing server....");

            // configure middleware
            this.middlewareConfig.initialize();

            // Configure routes
            // this.configureRoutes();

            // configure error handler 
            this.configureErrorHandlers();

            // connect database
            const dbConnected = await this.database.connect(5);

            if (!dbConnected) {
                throw new Error("Database connection failed");
            }

            console.log("server initialization complete");

        } catch (error) {
            console.error(' Server initialization failed:', error);
            throw error;
        }
    }

    // private configureRoutes(): void {
    //     // Health check endpoint
    //     this.app.get('/health', (req: Request, res: Response) => {
    //         res.status(200).json({
    //             status: 'healthy',
    //             timestamp: new Date().toISOString(),
    //             database: this.database.getConnectionStatus(),
    //             environment: this.config.nodeEnv
    //         });
    //     });

    //     // API routes
    //     this.app.use('/api/Ts/v1', this.router.getRouter());

    //     // 404 handler
    //     this.app.use('*', (req: Request, res: Response) => {
    //         res.status(404).json({
    //             error: 'Route not found',
    //             path: req.originalUrl
    //         });
    //     });

    //     console.log('Routes configured');
    // }

    private configureErrorHandlers(): void {
        // Global error handler
        this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error('Unhandled error:', err);

            res.status(500).json({
                error: 'Internal server error',
                message: err.message
            });
        });
    }


    public async start(): Promise<void> {
        try {
            await this.initialize();

            this.server = this.app.listen(this.config.port, () => {
                console.log(`

                Server Started Successfully!
                Port:      ${String(this.config.port).padEnd(32)}
                Database:  ${this.database.getConnectionStatus() ? 'Connected' : 'Disconnected'.padEnd(32)}

                `);
            });

            this.setupGracefulShutdown();

        } catch (error) {
            console.error(' Failed to start server:', error);
            process.exit(1);
        }
    }


    private setupGracefulShutdown(): void {
        const shutdown = async (signal: string) => {
            if (this.isShuttingDown) return;
            this.isShuttingDown = true;

            console.log(`\n Received ${signal}. Shutting down gracefully...`);

            // Close server
            if (this.server) {
                await new Promise((resolve) => this.server?.close(resolve));
                console.log(' HTTP server closed');
            }

            // Close database connection
            await this.database.disconnect();

            console.log(' Shutdown complete');
            process.exit(0);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
}


