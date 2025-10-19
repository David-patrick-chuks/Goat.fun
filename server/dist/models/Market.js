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
exports.Market = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BuyerSchema = new mongoose_1.Schema({
    wallet: { type: String, required: true },
    side: { type: String, enum: ["bullish", "fade"], required: true },
    shares: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return !isNaN(v) && isFinite(v) && v > 0;
            },
            message: 'shares must be a valid positive number'
        }
    },
    price: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return !isNaN(v) && isFinite(v) && v > 0;
            },
            message: 'price must be a valid positive number'
        }
    },
}, { _id: false });
const LivestreamSchema = new mongoose_1.Schema({
    isLive: { type: Boolean, default: false },
    streamKey: String,
    playbackUrl: String,
    roomName: String,
    thumbnail: String,
    totalViews: Number,
    endedAt: Date,
}, { _id: false });
const CreatorRevenueSchema = new mongoose_1.Schema({
    totalEarned: {
        type: Number,
        default: 0,
        validate: {
            validator: function (v) {
                return !isNaN(v) && isFinite(v);
            },
            message: 'totalEarned must be a valid number'
        }
    },
    revenueShare: {
        type: Number,
        default: 0.05,
        validate: {
            validator: function (v) {
                return !isNaN(v) && isFinite(v);
            },
            message: 'revenueShare must be a valid number'
        }
    },
    withdrawable: {
        type: Number,
        default: 0,
        validate: {
            validator: function (v) {
                return !isNaN(v) && isFinite(v);
            },
            message: 'withdrawable must be a valid number'
        }
    },
    lastWithdrawn: Date,
}, { _id: false });
const MarketSchema = new mongoose_1.Schema({
    creator: { type: String, required: true, index: true },
    title: { type: String, required: true },
    ticker: { type: String, required: true, index: true },
    description: String,
    media: String,
    banner: String,
    socialLinks: { type: [String], default: [] },
    duration: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true, index: true },
    bullishSupply: {
        type: Number,
        default: 0,
        validate: {
            validator: function (v) {
                return !isNaN(v) && isFinite(v);
            },
            message: 'bullishSupply must be a valid number'
        }
    },
    fadeSupply: {
        type: Number,
        default: 0,
        validate: {
            validator: function (v) {
                return !isNaN(v) && isFinite(v);
            },
            message: 'fadeSupply must be a valid number'
        }
    },
    bullishPrice: {
        type: Number,
        default: 1,
        validate: {
            validator: function (v) {
                return !isNaN(v) && isFinite(v);
            },
            message: 'bullishPrice must be a valid number'
        }
    },
    fadePrice: {
        type: Number,
        default: 1,
        validate: {
            validator: function (v) {
                return !isNaN(v) && isFinite(v);
            },
            message: 'fadePrice must be a valid number'
        }
    },
    poolBalance: {
        type: Number,
        default: 0,
        validate: {
            validator: function (v) {
                return !isNaN(v) && isFinite(v);
            },
            message: 'poolBalance must be a valid number'
        }
    },
    buyers: { type: [BuyerSchema], default: [] },
    livestream: { type: LivestreamSchema, default: () => ({ isLive: false }) },
    creatorRevenue: { type: CreatorRevenueSchema, default: () => ({ totalEarned: 0, revenueShare: 0.05, withdrawable: 0 }) },
    status: { type: String, enum: ["active", "ended", "cancelled"], default: "active", index: true },
    finalResult: { type: String, enum: ["bullish", "fade", "none"], default: "none" },
    createdAt: { type: Date, default: () => new Date() },
});
MarketSchema.pre('save', function (next) {
    const numericFields = ['bullishSupply', 'fadeSupply', 'bullishPrice', 'fadePrice', 'poolBalance'];
    numericFields.forEach(field => {
        if (isNaN(this[field]) || !isFinite(this[field])) {
            this[field] = 0;
        }
    });
    if (this.creatorRevenue) {
        if (isNaN(this.creatorRevenue.totalEarned) || !isFinite(this.creatorRevenue.totalEarned)) {
            this.creatorRevenue.totalEarned = 0;
        }
        if (isNaN(this.creatorRevenue.withdrawable) || !isFinite(this.creatorRevenue.withdrawable)) {
            this.creatorRevenue.withdrawable = 0;
        }
        if (isNaN(this.creatorRevenue.revenueShare) || !isFinite(this.creatorRevenue.revenueShare)) {
            this.creatorRevenue.revenueShare = 0.05;
        }
    }
    if (this.buyers && Array.isArray(this.buyers)) {
        this.buyers = this.buyers.filter(buyer => {
            return buyer.wallet &&
                buyer.side &&
                !isNaN(buyer.shares) &&
                isFinite(buyer.shares) &&
                buyer.shares > 0 &&
                !isNaN(buyer.price) &&
                isFinite(buyer.price) &&
                buyer.price > 0;
        });
    }
    next();
});
exports.Market = mongoose_1.default.models.Market || mongoose_1.default.model("Market", MarketSchema);
//# sourceMappingURL=Market.js.map