"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
exports.disconnectMongo = disconnectMongo;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
function sanitizeMongoUri(uri) {
    try {
        if (uri.startsWith("mongodb+srv://")) {
            const protocol = "mongodb+srv://";
            const rest = uri.slice(protocol.length);
            const slashIndex = rest.indexOf("/");
            const hostPart = slashIndex === -1 ? rest : rest.slice(0, slashIndex);
            const pathPart = slashIndex === -1 ? "" : rest.slice(slashIndex);
            const sanitizedHost = hostPart.replace(/:(\d+)$/, "");
            return protocol + sanitizedHost + pathPart;
        }
        return uri;
    }
    catch {
        return uri;
    }
}
async function connectMongo() {
    if (mongoose_1.default.connection.readyState === 1)
        return;
    const options = {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
    };
    const uri = sanitizeMongoUri(env_1.env.MONGO_URI);
    await mongoose_1.default.connect(uri, options);
    const { host, name } = mongoose_1.default.connection;
    console.log(`[db] connected host=${host} db=${name}`);
}
async function disconnectMongo() {
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.disconnect();
    }
}
//# sourceMappingURL=mongo.js.map