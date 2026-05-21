import express from "express";
import { AppConfig } from "../Config/Config";

export class MiddlewareConfig {
    private app: express.Application;
    private config: AppConfig;

    constructor(app:express.Application) {
        this.app = app;
        this.config = AppConfig.getInstance();
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