"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.common = void 0;
const ethereumjs_common_1 = __importDefault(require("ethereumjs-common"));
const options = {
    name: 'interstate',
    network_id: 50005,
    chain_id: 50005,
    hardfork: "istanbul",
    hardforks: ['byzantium', 'constantinople', 'petersburg', 'istanbul']
};
exports.common = ethereumjs_common_1.default.forCustomChain("mainnet", // TODO needs to match chain id
{
    name: options.name,
    networkId: options.network_id,
    chainId: options.chain_id,
    comment: "Local test network",
    bootstrapNodes: []
}, options.hardfork, options.hardforks);
