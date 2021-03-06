"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const ethereumjs_util_1 = require("ethereumjs-util");
const BYTE_SIZE = 256;
class Bloom {
    constructor(bitvector) {
        if (!bitvector) {
            this.bitvector = ethereumjs_util_1.zeros(BYTE_SIZE);
        }
        else {
            assert_1.default(bitvector.length === BYTE_SIZE, 'bitvectors must be 2048 bits long');
            this.bitvector = bitvector;
        }
    }
    add(e) {
        assert_1.default(Buffer.isBuffer(e), 'Element should be buffer');
        e = ethereumjs_util_1.keccak256(e);
        const mask = 2047;
        for (let i = 0; i < 3; i++) {
            const first2bytes = e.readUInt16BE(i * 2);
            const loc = mask & first2bytes;
            const byteLoc = loc >> 3;
            const bitLoc = 1 << loc % 8;
            this.bitvector[BYTE_SIZE - byteLoc - 1] |= bitLoc;
        }
    }
    check(e) {
        assert_1.default(Buffer.isBuffer(e), 'Element should be Buffer');
        e = ethereumjs_util_1.keccak256(e);
        const mask = 2047;
        let match = true;
        for (let i = 0; i < 3 && match; i++) {
            const first2bytes = e.readUInt16BE(i * 2);
            const loc = mask & first2bytes;
            const byteLoc = loc >> 3;
            const bitLoc = 1 << loc % 8;
            match = (this.bitvector[BYTE_SIZE - byteLoc - 1] & bitLoc) !== 0;
        }
        return Boolean(match);
    }
    multiCheck(topics) {
        return topics.every((t) => this.check(t));
    }
    or(bloom) {
        if (bloom) {
            for (let i = 0; i <= BYTE_SIZE; i++) {
                this.bitvector[i] = this.bitvector[i] | bloom.bitvector[i];
            }
        }
    }
}
exports.default = Bloom;
//# sourceMappingURL=index.js.map