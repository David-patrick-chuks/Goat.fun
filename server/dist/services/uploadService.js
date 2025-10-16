"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatarFromBuffer = uploadAvatarFromBuffer;
exports.uploadLocalFile = uploadLocalFile;
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("../config/cloudinary");
async function uploadAvatarFromBuffer(buffer, filename) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.cloudinary.uploader.upload_stream({ folder: "goatfun/avatars", resource_type: "image", public_id: path_1.default.parse(filename).name }, (error, result) => {
            if (error || !result)
                return reject(new Error(String(error)));
            resolve({ public_id: result.public_id, secure_url: result.secure_url });
        });
        stream.end(buffer);
    });
}
async function uploadLocalFile(filePath, folder = "goatfun/avatars") {
    const result = await cloudinary_1.cloudinary.uploader.upload(filePath, { folder, resource_type: "image" });
    return { public_id: result.public_id, secure_url: result.secure_url };
}
//# sourceMappingURL=uploadService.js.map