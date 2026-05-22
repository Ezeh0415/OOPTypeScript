import express from 'express';
import { Config } from '../Config/DevConfig';
import router from '../Route/Route';

export class DevMiddlewareConfig {
    private app: express.Application;
    private config: Config;

    constructor(app: express.Application) {
        this.app = app;
        this.config = Config.getInstance();
    }

    public initialize(): void {
        this.configureBodyParser();
    }

    private configureBodyParser(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use("/api", router); 
        console.log("body parsers configured");
    }


}