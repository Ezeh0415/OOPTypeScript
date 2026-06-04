"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevMiddlewareConfig = void 0;
const express_1 = __importDefault(require("express"));
const DevConfig_1 = require("../Config/DevConfig");
const Route_1 = __importDefault(require("../Route/Route"));
const Passport_1 = require("../Middleware/Passport.ts/Passport");
const session = require('express-session');
class DevMiddlewareConfig {
    constructor(app) {
        this.passport = Passport_1.passportConfigure.initialize();
        this.app = app;
        this.config = DevConfig_1.Config.getInstance();
    }
    initialize() {
        this.configureBodyParser();
    }
    configureBodyParser() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
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
        this.app.use("/api", Route_1.default);
        console.log("body parsers configured");
    }
}
exports.DevMiddlewareConfig = DevMiddlewareConfig;
