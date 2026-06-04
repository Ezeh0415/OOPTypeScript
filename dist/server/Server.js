"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppServer = void 0;
const express_1 = __importDefault(require("express"));
const Middleware_1 = require("./Middleware");
const DataBase_1 = require("../Config/DataBase");
const Config_1 = require("../Config/Config");
class AppServer {
    constructor() {
        this.isShuttingDown = false;
        this.app = (0, express_1.default)();
        this.config = Config_1.AppConfig.getInstance();
        this.database = DataBase_1.Database.getInstance();
        this.middlewareConfig = new Middleware_1.MiddlewareConfig(this.app);
    }
    async initialize() {
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
        }
        catch (error) {
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
    configureErrorHandlers() {
        // Global error handler
        this.app.use((err, req, res, next) => {
            console.error('Unhandled error:', err);
            res.status(500).json({
                error: 'Internal server error',
                message: err.message
            });
        });
    }
    async start() {
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
        }
        catch (error) {
            console.error(' Failed to start server:', error);
            process.exit(1);
        }
    }
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            if (this.isShuttingDown)
                return;
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
exports.AppServer = AppServer;
