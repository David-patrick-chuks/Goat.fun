"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploadService_1 = require("../services/uploadService");
async function main() {
    const localPath = path_1.default.resolve(path_1.default.join(__dirname, "..", "GOATFUNavatar.png"));
    if (!fs_1.default.existsSync(localPath)) {
        throw new Error(`Default avatar not found at ${localPath}`);
    }
    const res = await (0, uploadService_1.uploadLocalFile)(localPath, "goatfun/defaults");
    // Print the URL so the user can copy it into DEFAULT_AVATAR_URL
    console.log(res.secure_url);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=uploadDefaultAvatar.js.map