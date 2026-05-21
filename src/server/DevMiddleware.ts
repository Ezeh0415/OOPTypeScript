import express from 'express';
import { Config } from '../Config/DevConfig';

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
        console.log("body parsers configured");
    }


}