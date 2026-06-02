import mongoose, { Schema, Document, model, Model } from "mongoose";

// ==================== ENUMS ====================
export enum PaymentProvider {
    PAYSTACK = "paystack",
    FLUTTERWAVE = "flutterwave"
}

export enum PaymentType {
    DEPOSIT = "deposit",
    TRANSFER = "transfer",
    WITHDRAWAL = "withdrawal",
    REFUND = "refund"
}

export enum PaymentStatus {
    PENDING = "pending",
    SUCCESSFUL = "successful",
    FAILED = "failed",
    PROCESSING = "processing",
    CANCELLED = "cancelled"
}

export enum TransferAction {
    INSTANT = "instant",
    DEFERRED = "deferred",
    SCHEDULED = "scheduled"
}

export enum TransferType {
    BANK = "bank",
    WALLET = "wallet"
}

// ==================== INTERFACES ====================

// Provider-specific metadata
export interface IPaystackMetadata {
    reference: string;
    accessCode: string;
    paymentRef: string;
    authorizationCode: string;
    transactionId: string;
    paymentMethod: string;
    paidAt?: Date;
    [key: string]: any;
}

export interface IFlutterwaveMetadata {
    trfId?: string;           // Transfer ID from Flutterwave
    flutterId?: string;       // Recipient ID
    idempotencyKey?: string;
    traceId?: string;
    action?: TransferAction;
    sourceCurrency?: string;
    destinationCurrency?: string;
    narration?: string;
    [key: string]: any;
}

// Recipient interface for transfers
export interface IRecipient {
    type: string;
    id: string;
    name: object | string;
    currency: string;
    bank: {
        account_number: string;
        code: string;
    };
}

// Amount interface for complex amount objects
export interface IAmount {
    value: number;
    applies_to: string;
}

// Main unified Payment interface
export interface IPayment extends Document {
    // Core fields
    userId: string | object;
    amount: number | IAmount;
    currency: string;
    status: PaymentStatus;
    paymentType: PaymentType;
    provider: PaymentProvider;

    // Common fields
    reference: string;
    customerEmail: string;
    customerName?: string;
    metadata?: object;
    completedAt?: Date;

    // Paystack specific fields (optional)
    paystack?: IPaystackMetadata;

    // Flutterwave specific fields (optional)
    flutterwave?: IFlutterwaveMetadata & {
        recipient?: IRecipient;
        type?: TransferType;
    };

    // Refund fields
    originalPaymentId?: string;
    refundReason?: string;
    refundAmount?: number;
}

// ==================== SCHEMA ====================

const PaymentSchema = new Schema<IPayment>(
    {
        // Core fields
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        amount: {
            type: Schema.Types.Mixed,
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
                name: { type: Schema.Types.Mixed },
                currency: { type: String },
                bank: {
                    account_number: { type: String },
                    code: { type: String }
                }
            }
        },

        // Refund fields
        originalPaymentId: {
            type: Schema.Types.ObjectId,
            ref: "Payment",
            sparse: true
        },
        refundReason: { type: String },
        refundAmount: { type: Number }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

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
PaymentSchema.virtual('amountValue').get(function (this: IPayment) {
    if (typeof this.amount === 'number') {
        return this.amount;
    } else if (this.amount && typeof this.amount === 'object' && 'value' in this.amount) {
        return this.amount.value;
    }
    return 0;
});

// Virtual to check if payment is completed
PaymentSchema.virtual('isCompleted').get(function (this: IPayment) {
    return this.status === PaymentStatus.SUCCESSFUL;
});

// Virtual to get display name based on provider
PaymentSchema.virtual('displayName').get(function (this: IPayment) {
    if (this.provider === PaymentProvider.PAYSTACK) {
        return `Paystack ${this.paymentType} - ${this.reference}`;
    } else {
        return `Flutterwave ${this.paymentType} - ${this.reference}`;
    }
});

// ==================== METHODS ====================

// Method to mark payment as successful
PaymentSchema.methods.markAsSuccessful = async function (this: IPayment, completedData?: any) {
    this.status = PaymentStatus.SUCCESSFUL;
    this.completedAt = new Date();

    if (completedData) {
        if (this.provider === PaymentProvider.PAYSTACK && completedData.paystack) {
            this.paystack = { ...this.paystack, ...completedData.paystack };
        } else if (this.provider === PaymentProvider.FLUTTERWAVE && completedData.flutterwave) {
            this.flutterwave = { ...this.flutterwave, ...completedData.flutterwave };
        }
    }

    await this.save();
    return this;
};

// Method to mark payment as failed
PaymentSchema.methods.markAsFailed = async function (this: IPayment, errorMessage?: string) {
    this.status = PaymentStatus.FAILED;
    this.metadata = { ...this.metadata, error: errorMessage };
    await this.save();
    return this;
};

// ==================== STATICS ====================

interface IPaymentModel extends Model<IPayment> {
    findByReference(reference: string): Promise<IPayment | null>;
    findByUser(userId: string, options?: { limit?: number; offset?: number }): Promise<IPayment[]>;
    getSuccessfulPaymentsByUser(userId: string): Promise<IPayment[]>;
    getUserPaymentStats(userId: string): Promise<{
        totalSpent: number;
        totalDeposits: number;
        totalWithdrawals: number;
        successfulPayments: number;
        failedPayments: number;
    }>
}

PaymentSchema.statics.findByReference = function (reference: string) {
    return this.findOne({ reference });
};

PaymentSchema.statics.findByUser = function (userId: string, options: { limit?: number; offset?: number } = {}) {
    const { limit = 50, offset = 0 } = options;
    return this.find({ userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
};

PaymentSchema.statics.getSuccessfulPaymentsByUser = function (userId: string) {
    return this.find({
        userId,
        status: PaymentStatus.SUCCESSFUL
    }).sort({ createdAt: -1 });
};

PaymentSchema.statics.getUserPaymentStats = async function (userId: string): Promise<{
    totalSpent: number;
    totalDeposits: number;
    totalWithdrawals: number;
    successfulPayments: number;
    failedPayments: number;
}> {
    const stats = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId)
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

export const PaymentModel = model<IPayment, IPaymentModel>("Payment", PaymentSchema);
