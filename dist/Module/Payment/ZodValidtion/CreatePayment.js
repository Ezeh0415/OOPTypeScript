"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPayment = exports.initTransfer = exports.createPayment = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createPayment = zod_1.default.object({
    amount: zod_1.default.number()
});
exports.initTransfer = zod_1.default.object({
    account_number: zod_1.default.string(),
    code: zod_1.default.string()
});
exports.initPayment = zod_1.default.object({
    amount: zod_1.default.number(),
    narration: zod_1.default.string()
});
