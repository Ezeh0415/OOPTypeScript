"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cardInfo = void 0;
const zod_1 = __importDefault(require("zod"));
exports.cardInfo = zod_1.default.object({
    card_number: zod_1.default.string(),
    expiry_month: zod_1.default.string(),
    expiry_year: zod_1.default.string(),
    card_cvv: zod_1.default.string(),
});
