"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class Database {
    constructor() {
        this.isConnected = false;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.retryDelay = 2000; // milliseconds
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    getConnectionString() {
        return process.env.DB_URL || 'mongodb://localhost:27017/myapp';
    }
    getConnectionOptions() {
        return {
            autoIndex: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };
    }
    async connect(maxRetries = 5) {
        this.maxRetries = maxRetries;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(` Connecting to MongoDB (attempt ${attempt}/${this.maxRetries})...`);
                const connection = await mongoose_1.default.connect(this.getConnectionString(), this.getConnectionOptions());
                this.isConnected = true;
                this.retryCount = 0;
                console.log(` MongoDB Connected: ${connection.connection.host}/${connection.connection.name}`);
                this.setupEventListeners();
                return true;
            }
            catch (error) {
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
    setupEventListeners() {
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('mongoDb disconnected');
            this.isConnected = false;
            this.handleDisconnection();
        });
        mongoose_1.default.connection.on('error', (err) => {
            console.error(' MongoDB error:', err);
        });
        process.on('SIGINT', async () => {
            await this.disconnect();
            process.exit(0);
        });
    }
    async handleDisconnection() {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(` Reconnecting (${this.retryCount}/${this.maxRetries})...`);
            await this.delay(this.retryDelay);
            await this.connect();
        }
        else {
            console.error(' Max reconnection attempts reached');
        }
    }
    async disconnect() {
        if (this.isConnected) {
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            console.log(' MongoDB disconnected gracefully');
        }
    }
    getConnectionStatus() {
        return this.isConnected;
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.Database = Database;
exports.default = Database.getInstance();
