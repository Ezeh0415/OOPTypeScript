// app.ts
import { AppServer } from './server/Server';

class Application {
    private server: AppServer;

    constructor() {
        this.server = new AppServer();
    }

    public async run(): Promise<void> {
        try {
            await this.server.start();
        } catch (error) {
            console.error('Application failed to start:', error);
            process.exit(1);
        }
    }
}

// Bootstrap the application
const app = new Application();
app.run();
