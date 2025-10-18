"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    PORT: Number(process.env.PORT ?? 8080),
    MONGO_URI: process.env.MONGO_URI ?? "mongodb+srv://goatfun:Dave#dave5686@cluster0.z4pn6ak.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",
};
//# sourceMappingURL=env.js.map