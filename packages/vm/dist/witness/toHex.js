"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHex = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
function toHex(x) {
    if (ethereumjs_util_1.BN.isBN(x))
        return `0x${x.toString('hex')}`;
    return ethereumjs_util_1.bufferToHex(x);
}
exports.toHex = toHex;
exports.default = toHex;
//# sourceMappingURL=toHex.js.map