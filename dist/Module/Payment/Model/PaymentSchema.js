"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModel = exports.TransferType = exports.TransferAction = exports.PaymentStatus = exports.PaymentType = exports.PaymentProvider = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// ==================== ENUMS ====================
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["PAYSTACK"] = "paystack";
    PaymentProvider["FLUTTERWAVE"] = "flutterwave";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["DEPOSIT"] = "deposit";
    PaymentType["TRANSFER"] = "transfer";
    PaymentType["WITHDRAWAL"] = "withdrawal";
    PaymentType["REFUND"] = "refund";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["SUCCESSFUL"] = "successful";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["PROCESSING"] = "processing";
    PaymentStatus["CANCELLED"] = "cancelled";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var TransferAction;
(function (TransferAction) {
    TransferAction["INSTANT"] = "instant";
    TransferAction["DEFERRED"] = "deferred";
    TransferAction["SCHEDULED"] = "scheduled";
})(TransferAction || (exports.TransferAction = TransferAction = {}));
var TransferType;
(function (TransferType) {
    TransferType["BANK"] = "bank";
    TransferType["WALLET"] = "wallet";
})(TransferType || (exports.TransferType = TransferType = {}));
// ==================== SCHEMA ====================
const PaymentSchema = new mongoose_1.Schema({
    // Core fields
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true
    },
    currency: {
        type: String,
        default: "NGN",
        required: true
    },
    status: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING,
        required: true
    },
    paymentType: {
        type: String,
        enum: Object.values(PaymentType),
        required: true
    },
    provider: {
        type: String,
        enum: Object.values(PaymentProvider),
        required: true
    },
    // Common fields
    reference: {
        type: String,
        required: true,
        unique: true,
        sparse: true
    },
    customerEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    customerName: {
        type: String,
        trim: true
    },
    metadata: {
        type: Object,
        default: {}
    },
    completedAt: {
        type: Date
    },
    // Paystack specific fields
    paystack: {
        reference: { type: String },
        accessCode: { type: String },
        authorizationCode: { type: String },
        transactionId: { type: String },
        paymentMethod: { type: String },
        paidAt: { type: Date }
    },
    // Flutterwave specific fields
    flutterwave: {
        trfId: {
            type: String,
            sparse: true
        },
        flutterId: {
            type: String,
            sparse: true
        },
        idempotencyKey: {
            type: String,
            unique: true,
            sparse: true
        },
        traceId: {
            type: String,
            unique: true,
            sparse: true
        },
        action: {
            type: String,
            enum: Object.values(TransferAction),
            default: TransferAction.INSTANT
        },
        sourceCurrency: {
            type: String,
            default: "NGN"
        },
        destinationCurrency: {
            type: String,
            default: "NGN"
        },
        narration: { type: String },
        type: {
            type: String,
            enum: Object.values(TransferType),
            default: TransferType.BANK
        },
        recipient: {
            type: { type: String },
            id: { type: String },
            name: { type: mongoose_1.Schema.Types.Mixed },
            currency: { type: String },
            bank: {
                account_number: { type: String },
                code: { type: String }
            }
        }
    },
    // Refund fields
    originalPaymentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Payment",
        sparse: true
    },
    refundReason: { type: String },
    refundAmount: { type: Number }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// ==================== INDEXES ====================
// Core indexes
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ reference: 1 }, { unique: true });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ provider: 1 });
PaymentSchema.index({ paymentType: 1 });
PaymentSchema.index({ customerEmail: 1 });
// Provider-specific indexes
PaymentSchema.index({ "paystack.transactionId": 1 });
PaymentSchema.index({ "flutterwave.trfId": 1 });
PaymentSchema.index({ "flutterwave.idempotencyKey": 1 }, { unique: true, sparse: true });
PaymentSchema.index({ "flutterwave.traceId": 1 }, { unique: true, sparse: true });
// Compound indexes
PaymentSchema.index({ userId: 1, provider: 1, createdAt: -1 });
PaymentSchema.index({ userId: 1, paymentType: 1, status: 1 });
// Auto-delete pending payments after 24 hours
PaymentSchema.index({
    createdAt: 1,
    status: 1
}, {
    expireAfterSeconds: 86400,
    partialFilterExpression: {
        status: PaymentStatus.PENDING
    }
});
// ==================== VIRTUALS ====================
// Virtual for getting the actual amount value
PaymentSchema.virtual('amountValue').get(function () {
    if (typeof this.amount === 'number') {
        return this.amount;
    }
    else if (this.amount && typeof this.amount === 'object' && 'value' in this.amount) {
        return this.amount.value;
    }
    return 0;
});
// Virtual to check if payment is completed
PaymentSchema.virtual('isCompleted').get(function () {
    return this.status === PaymentStatus.SUCCESSFUL;
});
// Virtual to get display name based on provider
PaymentSchema.virtual('displayName').get(function () {
    if (this.provider === PaymentProvider.PAYSTACK) {
        return `Paystack ${this.paymentType} - ${this.reference}`;
    }
    else {
        return `Flutterwave ${this.paymentType} - ${this.reference}`;
    }
});
// ==================== METHODS ====================
// Method to mark payment as successful
PaymentSchema.methods.markAsSuccessful = async function (completedData) {
    this.status = PaymentStatus.SUCCESSFUL;
    this.completedAt = new Date();
    if (completedData) {
        if (this.provider === PaymentProvider.PAYSTACK && completedData.paystack) {
            this.paystack = { ...this.paystack, ...completedData.paystack };
        }
        else if (this.provider === PaymentProvider.FLUTTERWAVE && completedData.flutterwave) {
            this.flutterwave = { ...this.flutterwave, ...completedData.flutterwave };
        }
    }
    await this.save();
    return this;
};
// Method to mark payment as failed
PaymentSchema.methods.markAsFailed = async function (errorMessage) {
    this.status = PaymentStatus.FAILED;
    this.metadata = { ...this.metadata, error: errorMessage };
    await this.save();
    return this;
};
PaymentSchema.statics.findByReference = function (reference) {
    return this.findOne({ reference });
};
PaymentSchema.statics.findByUser = function (userId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    return this.find({ userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
};
PaymentSchema.statics.getSuccessfulPaymentsByUser = function (userId) {
    return this.find({
        userId,
        status: PaymentStatus.SUCCESSFUL
    }).sort({ createdAt: -1 });
};
PaymentSchema.statics.getUserPaymentStats = async function (userId) {
    const stats = await this.aggregate([
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId)
            }
        },
        {
            $facet: {
                // Successful payments stats
                successful: [
                    { $match: { status: PaymentStatus.SUCCESSFUL } },
                    {
                        $group: {
                            _id: null,
                            totalDeposits: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$paymentType", PaymentType.DEPOSIT] },
                                        {
                                            $cond: [
                                                { $eq: ["$provider", PaymentProvider.PAYSTACK] },
                                                { $toDouble: "$amount" },
                                                { $toDouble: "$amount" }
                                            ]
                                        },
                                        0
                                    ]
                                }
                            },
                            totalWithdrawals: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$paymentType", PaymentType.WITHDRAWAL] },
                                        { $toDouble: "$amount" },
                                        0
                                    ]
                                }
                            },
                            successfulPayments: { $sum: 1 }
                        }
                    }
                ],
                // Failed payments count
                failed: [
                    { $match: { status: PaymentStatus.FAILED } },
                    {
                        $group: {
                            _id: null,
                            failedPayments: { $sum: 1 }
                        }
                    }
                ]
            }
        },
        {
            $project: {
                totalDeposits: { $ifNull: [{ $arrayElemAt: ["$successful.totalDeposits", 0] }, 0] },
                totalWithdrawals: { $ifNull: [{ $arrayElemAt: ["$successful.totalWithdrawals", 0] }, 0] },
                successfulPayments: { $ifNull: [{ $arrayElemAt: ["$successful.successfulPayments", 0] }, 0] },
                failedPayments: { $ifNull: [{ $arrayElemAt: ["$failed.failedPayments", 0] }, 0] }
            }
        }
    ]);
    const result = stats[0] || {
        totalDeposits: 0,
        totalWithdrawals: 0,
        successfulPayments: 0,
        failedPayments: 0
    };
    return {
        totalSpent: result.totalDeposits, // Total deposits made
        totalDeposits: result.totalDeposits,
        totalWithdrawals: result.totalWithdrawals,
        successfulPayments: result.successfulPayments,
        failedPayments: result.failedPayments
    };
};
// ==================== MODEL ====================
exports.PaymentModel = (0, mongoose_1.model)("Payment", PaymentSchema);
