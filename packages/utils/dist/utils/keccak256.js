"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashConcat = exports.keccak256 = void 0;
const keccak_1 = __importDefault(require("keccak"));
function keccak256(a) {
    return keccak_1.default(`keccak256`)
        .update(a)
        .digest();
}
exports.keccak256 = keccak256;
;
function hashConcat(a, b) {
    return keccak256(Buffer.concat([a, b]));
}
exports.hashConcat = hashConcat;
exports.default = keccak256;
