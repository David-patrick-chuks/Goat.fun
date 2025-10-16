"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usernameFromWallet = usernameFromWallet;
function usernameFromWallet(wallet) {
    const clean = (wallet || "").trim();
    const noPrefix = clean.startsWith("0x") || clean.startsWith("0X") ? clean.slice(2) : clean;
    const core = noPrefix.slice(0, 6) || "user";
    return core;
}
//# sourceMappingURL=user.js.map