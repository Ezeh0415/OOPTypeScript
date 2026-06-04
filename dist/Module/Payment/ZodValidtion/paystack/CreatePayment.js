"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayment = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createPayment = zod_1.default.object({
    amount: zod_1.default.number()
});
