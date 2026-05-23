import dotenv from "dotenv";

dotenv.config();

import {DevServer} from './src/server/DevServer';

class DevApplication {
    private server: DevServer;

    constructor() {
        this.server = new DevServer();
    }

    public async run(): Promise<void> {
        try {
            await this.server.start();
        } catch (error) {
            console.error('DevApplication failed to start:', error);
            process.exit(1);
        }
    }

}

// Bootstrap the application
const app = new DevApplication();
app.run();