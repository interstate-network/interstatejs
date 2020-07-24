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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tx_1 = require("@interstatejs/tx");
const ethUtil = __importStar(require("ethereumjs-util"));
const index_1 = require("./index");
const header_from_rpc_1 = __importDefault(require("./header-from-rpc"));
/**
 * Creates a new block object from Ethereum JSON RPC.
 *
 * @param blockParams - Ethereum JSON RPC of block (eth_getBlockByNumber)
 * @param uncles - Optional list of Ethereum JSON RPC of uncles (eth_getUncleByBlockHashAndIndex)
 * @param chainOptions - An object describing the blockchain
 */
function blockFromRpc(blockParams, uncles, chainOptions) {
    uncles = uncles || [];
    const header = header_from_rpc_1.default(blockParams, chainOptions);
    const block = new index_1.Block({
        header: header.encodeJSON(),
        transactions: [],
    }, chainOptions);
    if (blockParams.transactions) {
        for (const _txParams of blockParams.transactions) {
            const txParams = normalizeTxParams(_txParams);
            // override from address
            const fromAddress = ethUtil.toBuffer(txParams.from);
            delete txParams.from;
            const tx = new tx_1.FakeTransaction(txParams, chainOptions);
            tx.from = fromAddress;
            tx.getSenderAddress = function () {
                return fromAddress;
            };
            // override hash
            const txHash = ethUtil.toBuffer(txParams.hash);
            tx.hash = function () {
                return txHash;
            };
            block.transactions.push(tx);
        }
    }
    return block;
}
exports.default = blockFromRpc;
function normalizeTxParams(_txParams) {
    const txParams = Object.assign({}, _txParams);
    // hot fix for https://github.com/ethereumjs/ethereumjs-util/issues/40
    txParams.gasLimit = txParams.gasLimit === undefined ? txParams.gas : txParams.gasLimit;
    txParams.data = txParams.data === undefined ? txParams.input : txParams.data;
    // strict byte length checking
    txParams.to = txParams.to ? ethUtil.setLengthLeft(ethUtil.toBuffer(txParams.to), 20) : null;
    // v as raw signature value {0,1}
    txParams.v = txParams.v < 27 ? txParams.v + 27 : txParams.v;
    return txParams;
}
