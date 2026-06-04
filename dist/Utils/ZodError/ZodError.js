"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const zod_1 = require("zod");
class ErrorHandler {
    static handleZodError(res, error) {
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                })),
            });
            return true;
        }
        return false;
    }
}
exports.ErrorHandler = ErrorHandler;
