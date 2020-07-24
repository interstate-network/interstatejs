"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockQueryABI = exports.ConfirmedBlockQueryABI = exports.CommitmentHeaderQueryABI = exports.CommitmentHeaderABI = exports.BlockABI = exports.HeaderABI = exports.getDecodeABI = exports.setEncodeABI = void 0;
// const abi = require('web3-eth-abi').AbiCoder;
// const abi = ABI();
const abi_coder_1 = require("web3x/contract/abi-coder");
const abi = new abi_coder_1.ABICoder();
function setEncodeABI(_abi, obj) {
    obj.encodeABI = function () {
        return abi.encodeParameter(_abi, this.encodeJSON ? this.encodeJSON() : this);
    };
}
exports.setEncodeABI = setEncodeABI;
/* This is broken - need to add handling for numeric strings */
function getDecodeABI(_abi, _constructor) {
    return function (_encoded) {
        const x = abi.decodeParameter(_abi, _encoded);
        return new _constructor(x);
    };
}
exports.getDecodeABI = getDecodeABI;
exports.HeaderABI = {
    ISO_Header: {
        parentHash: 'bytes32',
        number: 'uint256',
        incomingTransactionsIndex: 'uint256',
        incomingTransactionsCount: 'uint256',
        transactionsCount: 'uint256',
        transactionsRoot: 'bytes32',
        stateRoot: 'bytes32',
        exitsRoot: 'bytes32',
        coinbase: 'address',
        timestamp: 'uint256',
    }
};
/*   ISO_Header: {
    parentHash: 'bytes32',
    number: 'uint256',
    parentChainHash: 'bytes32',
    parentChainHeight: 'uint256',
    incomingTransactionsCount: 'uint256',
    transactionsCount: 'uint256',
    transactionsRoot: 'bytes32',
    stateRoot: 'bytes32',
    exitsRoot: 'bytes32',
    coinbase: 'address',
    timestamp: 'uint256',
    gasLimit: 'uint256',
    gasUsed: 'uint256',
    exitGasPrice: 'uint256'
  } */
exports.BlockABI = {
    ISO_Block: {
        header: exports.HeaderABI.ISO_Header,
        transactions: 'bytes[]'
    }
};
exports.CommitmentHeaderABI = {
    CommitmentHeader: {
        submittedAt: 'uint256',
        exitsRoot: 'bytes32',
        coinbase: 'address',
        blockHash: 'bytes32'
    }
};
exports.CommitmentHeaderQueryABI = {
    CommitmentHeaderQuery: {
        parentHash: 'bytes32',
        childIndex: 'uint256',
        blockNumber: 'uint256',
        commitment: exports.CommitmentHeaderABI
    }
};
exports.ConfirmedBlockQueryABI = {
    ConfirmedBlockQuery: {
        blockNumber: 'uint256',
        blockHash: 'bytes32'
    }
};
exports.BlockQueryABI = {
    BlockQuery: {
        confirmed: 'bool',
        queryData: 'bytes'
    }
};
