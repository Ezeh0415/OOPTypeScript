import express from 'express';
import { Config } from '../Config/DevConfig';
import router from '../Route/Route';
import { passportConfigure } from '../Middleware/Passport.ts/Passport';
const session = require('express-session');

export class DevMiddlewareConfig {
    private app: express.Application;
    private config: Config;
    private passport = passportConfigure.initialize();

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
        // Session middleware (REQUIRED for passport)
        this.app.use(session({
            secret: this.config.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false, // Set to true if using HTTPS
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            }
        }));
        this.app.use(this.passport.initialize());
        this.app.use(this.passport.session());
        this.app.use("/api", router);
        console.log("body parsers configured");
    }


}