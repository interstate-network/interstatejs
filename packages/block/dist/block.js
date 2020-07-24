"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
// const { Transaction } = require('@interstatejs/tx');
const header_1 = require("./header");
const tx_1 = require("@interstatejs/tx");
const abi_1 = require("./abi");
const utils_1 = require("@interstatejs/utils");
/**
 * An object that represents the block
 */
class Block {
    /**
     * Creates a new block object
     *
     * @param data - The block's data.
     * @param opts - The network options for this block, and its header, uncle headers and txs.
     */
    constructor(data = {}, opts = {}) {
        this.transactions = [];
        this.outgoingTransactions = [];
        if (opts.common) {
            if (opts.chain !== undefined || opts.hardfork !== undefined) {
                throw new Error('Instantiation with both opts.common and opts.chain / opts.hardfork parameter not allowed!');
            }
            this._common = opts.common;
        }
        else {
            // const chain = opts.chain ? opts.chain : 'mainnet'
            // TODO: Compute the hardfork based on this block's number. It can be implemented right now
            // because the block number is not immutable, so the Common can get out of sync.
            // const hardfork = opts.hardfork ? opts.hardfork : null
            // this._common = new Common(chain, hardfork)
            this._common = utils_1.common;
        }
        let rawTransactions;
        if (Buffer.isBuffer(data)) {
            const dataAsAny = ethereumjs_util_1.rlp.decode(data);
            data = dataAsAny;
        }
        if (Array.isArray(data)) {
            this.header = new header_1.BlockHeader(data[0], { common: this._common });
            rawTransactions = data[1];
        }
        else {
            this.header = new header_1.BlockHeader(data.header, { common: this._common });
            rawTransactions = data.transactions || [];
        }
        for (let i = 0; i < rawTransactions.length; i++) {
            const tx = new tx_1.UnionTransaction(rawTransactions[i], opts);
            this.transactions.push(tx);
        }
        abi_1.setEncodeABI(abi_1.BlockABI, this);
    }
    get raw() {
        return this.serialize(false);
    }
    /**
     * Produces a hash the RLP of the block
     */
    hash() {
        return this.header.hash();
    }
    /**
     * Determines if this block is the genesis block
     */
    isGenesis() {
        return this.header.isGenesis();
    }
    /**
     * Turns the block into the canonical genesis block
     */
    setGenesisParams() {
        this.header.setGenesisParams();
    }
    serialize(rlpEncode = true) {
        const raw = [
            this.header.raw,
            this.transactions.map(tx => tx.raw),
        ];
        return rlpEncode ? ethereumjs_util_1.rlp.encode(raw) : raw;
    }
    validateTransactions(stringError = false) {
        const errors = [];
        this.transactions.forEach(function (tx, i) {
            const error = tx.validate(true);
            if (error) {
                errors.push(`${error} at tx ${i}`);
            }
        });
        if (!stringError) {
            return errors.length === 0;
        }
        return errors.join(' ');
    }
    /* Temporary replacement for toJSON. Did not replace toJSON completely to avoid breaking dependents. */
    encodeJSON() {
        return {
            header: this.header.encodeJSON(),
            transactions: this.transactions.map(tx => tx.encode(false, true, true))
        };
    }
    /**
     * Returns the block in JSON format
     *
     * @see {@link https://github.com/ethereumjs/ethereumjs-util/blob/master/docs/index.md#defineproperties|ethereumjs-util}
     */
    toJSON() {
        return this.encodeJSON();
    }
    setTransactionsRoot() {
        const leaves = this.transactions.map(tx => tx.toRollup());
        this.header.transactionsRoot = utils_1.getMerkleRoot(leaves);
    }
    setStateRoot() {
        this.header.stateRoot = this.transactions[this.transactions.length - 1].stateRoot;
    }
    setTransactionCounts() {
        this.header.incomingTransactionsCount = ethereumjs_util_1.toBuffer(this.transactions.filter(tx => tx.isIncoming).length);
        this.header.transactionsCount = ethereumjs_util_1.toBuffer(this.transactions.length);
    }
    setOutputs() {
        this.setTransactionsRoot();
        this.setTransactionCounts();
        this.setStateRoot();
    }
    proveTransaction(index) {
        if (index > this.transactions.length)
            throw new Error(`Index out of range. ${index} > ${this.transactions.length}`);
        const { siblings } = utils_1.getMerkleProof(this.transactions.map(t => t.toRollup()), index);
        return siblings;
    }
}
exports.Block = Block;
Block.decodeABI = abi_1.getDecodeABI(abi_1.BlockABI, Block);
