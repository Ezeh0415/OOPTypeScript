"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareConfig = void 0;
const express_1 = __importDefault(require("express"));
const Config_1 = require("../Config/Config");
class MiddlewareConfig {
    constructor(app) {
        this.app = app;
        this.config = Config_1.AppConfig.getInstance();
    }
    initialize() {
        this.configureBodyParser();
    }
    configureBodyParser() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        console.log("body parsers configured");
    }
}
exports.MiddlewareConfig = MiddlewareConfig;
