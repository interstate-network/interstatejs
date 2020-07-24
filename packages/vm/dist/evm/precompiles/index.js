"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrecompile = exports.precompiles = exports.ripemdPrecompileAddress = void 0;
const _01_ecrecover_1 = __importDefault(require("./01-ecrecover"));
const _02_sha256_1 = __importDefault(require("./02-sha256"));
const _03_ripemd160_1 = __importDefault(require("./03-ripemd160"));
const _04_identity_1 = __importDefault(require("./04-identity"));
const _05_modexp_1 = __importDefault(require("./05-modexp"));
const _06_ecadd_1 = __importDefault(require("./06-ecadd"));
const _07_ecmul_1 = __importDefault(require("./07-ecmul"));
const _08_ecpairing_1 = __importDefault(require("./08-ecpairing"));
const _09_blake2f_1 = __importDefault(require("./09-blake2f"));
exports.ripemdPrecompileAddress = '0000000000000000000000000000000000000003';
exports.precompiles = {
    '0000000000000000000000000000000000000001': _01_ecrecover_1.default,
    '0000000000000000000000000000000000000002': _02_sha256_1.default,
    '0000000000000000000000000000000000000003': _03_ripemd160_1.default,
    '0000000000000000000000000000000000000004': _04_identity_1.default,
    '0000000000000000000000000000000000000005': _05_modexp_1.default,
    '0000000000000000000000000000000000000006': _06_ecadd_1.default,
    '0000000000000000000000000000000000000007': _07_ecmul_1.default,
    '0000000000000000000000000000000000000008': _08_ecpairing_1.default,
    '0000000000000000000000000000000000000009': _09_blake2f_1.default,
};
function getPrecompile(address) {
    return exports.precompiles[address];
}
exports.getPrecompile = getPrecompile;
//# sourceMappingURL=index.js.map