import { Response } from "express";
import { ZodError } from "zod";

export class ErrorHandler {
    static handleZodError(res: Response, error: unknown): boolean {
        if (error instanceof ZodError) {
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