import mongoose from "mongoose";

interface IDatabaseConfig {
    url: string;
    options: mongoose.ConnectOptions;
}

export class Database {
    private static instance: Database;
    private isConnected: boolean = false;
    private retryCount: number = 0;
    private maxRetries: number = 5;
    private retryDelay: number = 2000; // milliseconds

    private constructor() { }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    private getConnectionString(): string {
        return process.env.DB_URL || 'mongodb://localhost:27017/myapp';
    }

    private getConnectionOptions(): mongoose.ConnectOptions {
        return {
            autoIndex: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };
    }

    public async connect(maxRetries: number = 5): Promise<boolean> {
        this.maxRetries = maxRetries;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(` Connecting to MongoDB (attempt ${attempt}/${this.maxRetries})...`);

                const connection = await mongoose.connect(
                    this.getConnectionString(),
                    this.getConnectionOptions()
                );


                this.isConnected = true;
                this.retryCount = 0;

                console.log(` MongoDB Connected: ${connection.connection.host}/${connection.connection.name}`);
                this.setupEventListeners();
                return true;

            } catch (error) {
                this.isConnected = false;
                console.error(` Connection failed (${attempt}/${this.maxRetries}):`, error);

                if (attempt === this.maxRetries) {
                    console.error(' Database connection failed after all retries');
                    return false;
                }

                await this.delay(this.retryDelay);
            }
        }

        return false;

    }

    private setupEventListeners(): void {
        mongoose.connection.on('disconnected', () => {
            console.log('mongoDb disconnected');
            this.isConnected = false;
            this.handleDisconnection();
        });

        mongoose.connection.on('error', (err) => {
            console.error(' MongoDB error:', err);
        });

        process.on('SIGINT', async () => {
            await this.disconnect();
            process.exit(0);
        });
    }

    private async handleDisconnection(): Promise<void> {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(` Reconnecting (${this.retryCount}/${this.maxRetries})...`);
            await this.delay(this.retryDelay);
            await this.connect();
        } else {
            console.error(' Max reconnection attempts reached');
        }
    }

    public async disconnect(): Promise<void> {
        if (this.isConnected) {
            await mongoose.disconnect();
            this.isConnected = false;
            console.log(' MongoDB disconnected gracefully');
        }
    }

    public getConnectionStatus(): boolean {
        return this.isConnected;
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

}

export default Database.getInstance();