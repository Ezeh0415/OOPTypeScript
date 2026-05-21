import mongoose from "mongoose";

interface IDatabase {
    url: string;
    options: mongoose.ConnectOptions;
}

export class DevDatabase {
    private static instance: DevDatabase;
    private isConnected: boolean = false;

    private constructor() { }

    public static getInstance(): DevDatabase {
        if (!DevDatabase.instance) {
            DevDatabase.instance = new DevDatabase();
        }
        return DevDatabase.instance;
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

    public async connect(): Promise<boolean> {
        try {
            const connection = await mongoose.connect(
                this.getConnectionString(),
                this.getConnectionOptions()
            );

            this.isConnected = true;

            console.log(` MongoDB Connected: ${connection.connection.host}/${connection.connection.name}`);

            return true;
        } catch (error) {
            this.isConnected = false;
            console.error(' MongoDB connection failed:', error);
        }
        return false;
    }


}