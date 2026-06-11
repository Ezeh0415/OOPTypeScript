"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInfo = void 0;
const zod_1 = __importDefault(require("zod"));
exports.userInfo = zod_1.default.object({
    city: zod_1.default.string().min(1, "City is required"),
    country: zod_1.default.string().min(1, "Country is required"),
    line1: zod_1.default.string().min(1, "Address line 1 is required"),
    line2: zod_1.default.string().optional(),
    postalCode: zod_1.default.number().int("Must be a whole number").positive("Must be positive"),
    state: zod_1.default.string().min(1, "State is required"),
    countryCode: zod_1.default.string(),
    number: zod_1.default.number().int("Must be a whole number").positive("Must be positive")
});
