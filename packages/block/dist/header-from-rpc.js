"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const header_1 = require("./header");
const ethUtil = __importStar(require("ethereumjs-util"));
/**
 * Creates a new block header object from Ethereum JSON RPC.
 *
 * @param blockParams - Ethereum JSON RPC of block (eth_getBlockByNumber)
 * @param chainOptions - An object describing the blockchain
 */
function blockHeaderFromRpc(blockParams, chainOptions) {
    const blockHeader = new header_1.BlockHeader({
        parentHash: blockParams.parentHash,
        number: blockParams.number,
        incomingTransactionsIndex: blockParams.incomingTransactionsIndex,
        incomingTransactionsCount: blockParams.incomingTransactionsCount,
        transactionsCount: blockParams.transactionsCount,
        transactionsRoot: blockParams.transactionsRoot,
        stateRoot: blockParams.stateRoot,
        exitsRoot: blockParams.exitsRoot,
        coinbase: blockParams.coinbase,
        timestamp: blockParams.timestamp
    }, chainOptions);
    // override hash in case something was missing
    blockHeader.hash = function () {
        return ethUtil.toBuffer(blockParams.hash);
    };
    return blockHeader;
}
exports.default = blockHeaderFromRpc;
