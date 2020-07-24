"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitmentHeader = void 0;
const utils_1 = require("@interstatejs/utils");
const ethereumjs_util_1 = require("ethereumjs-util");
const abi_1 = require("./abi");
class CommitmentHeader {
    constructor(options) {
        let { block, header, commitment } = options, _a = options.query, _b = _a === void 0 ? {} : _a, { commitment: qCommitment = null } = _b, query = __rest(_b, ["commitment"]), rest = __rest(options, ["block", "header", "commitment", "query"]);
        header = (block === null || block === void 0 ? void 0 : block.header) || header;
        let headerInfo = header ? {
            parentHash: header.parentHash,
            blockNumber: header.number,
            exitsRoot: header.exitsRoot,
            coinbase: header.coinbase,
            blockHash: header.hash()
        } : {};
        Object.assign(this, commitment || qCommitment || {}, query || {}, rest || {}, headerInfo);
        abi_1.setEncodeABI(abi_1.CommitmentHeaderABI, this);
    }
    hash() {
        return utils_1.keccak256(ethereumjs_util_1.toBuffer(this.encodeABI()));
    }
    encodeJSON() {
        return {
            parentHash: utils_1.toHex(this.parentHash),
            childIndex: utils_1.toHex(this.childIndex),
            blockNumber: utils_1.toHex(this.blockNumber),
            submittedAt: utils_1.toHex(this.submittedAt),
            exitsRoot: utils_1.toHex(this.exitsRoot),
            coinbase: utils_1.toHex(this.coinbase),
            blockHash: utils_1.toHex(this.blockHash),
            isConfirmed: this.isConfirmed || false
        };
    }
    get commitment() {
        const { submittedAt, exitsRoot, coinbase, blockHash } = this;
        return { submittedAt, exitsRoot, coinbase, blockHash };
    }
    set commitment(commitment) {
        Object.assign(this, commitment);
    }
    get query() {
        // const { parentHash, childIndex, blockNumber, commitment } = this;
        // if (parentHash == undefined) throw new Error(`Insufficient data for query: Missing parentHash.`)
        // if (childIndex == undefined) throw new Error(`Insufficient data for query: Missing childIndex.`)
        // if (blockNumber == undefined) throw new Error(`Insufficient data for query: Missing blockNumber.`);
        const _a = this.encodeJSON(), { parentHash, childIndex, blockNumber } = _a, commitment = __rest(_a, ["parentHash", "childIndex", "blockNumber"]);
        return {
            parentHash,
            childIndex,
            blockNumber,
            commitment
        };
        return { parentHash, childIndex, blockNumber, commitment };
    }
    set query(_query) {
        const { commitment } = _query, query = __rest(_query, ["commitment"]);
        Object.assign(this, commitment || {}, query);
    }
}
exports.CommitmentHeader = CommitmentHeader;
