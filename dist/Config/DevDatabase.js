"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class DevDatabase {
    constructor() {
        this.isConnected = false;
    }
    static getInstance() {
        if (!DevDatabase.instance) {
            DevDatabase.instance = new DevDatabase();
        }
        return DevDatabase.instance;
    }
    getConnectionString() {
        const url = process.env.DB_URL;
        if (!url) {
            throw new Error('Environment variable DB_URL is not defined');
        }
        return url;
    }
    getConnectionOptions() {
        return {
            autoIndex: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };
    }
    async connect() {
        try {
            const connection = await mongoose_1.default.connect(this.getConnectionString(), this.getConnectionOptions());
            this.isConnected = true;
            console.log(` MongoDB Connected: ${connection.connection.host}/${connection.connection.name}`);
            return true;
        }
        catch (error) {
            this.isConnected = false;
            console.error(' MongoDB connection failed:', error);
        }
        return false;
    }
}
exports.DevDatabase = DevDatabase;
