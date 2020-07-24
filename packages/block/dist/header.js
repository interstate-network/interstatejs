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
exports.BlockHeader = void 0;
const utils = __importStar(require("ethereumjs-util"));
const ethereumjs_util_1 = require("ethereumjs-util");
const utils_1 = require("@interstatejs/utils");
const buffer_1 = require("buffer");
const commitment_1 = require("./commitment");
const abi_1 = require("./abi");
const { keccak256 } = require('@interstatejs/utils');
/**
 * An object that represents the block header
 */
class BlockHeader {
    /**
     * Creates a new block header.
     * @param data - The data of the block header.
     * @param opts - The network options for this block, and its header, uncle headers and txs.
     */
    constructor(data = [], opts = {}) {
        if (opts.common !== undefined) {
            if (opts.chain !== undefined || opts.hardfork !== undefined) {
                throw new Error('Instantiation with both opts.common and opts.chain / opts.hardfork parameter not allowed!');
            }
            this._common = opts.common;
        }
        else {
            // const chain = opts.chain ? opts.chain : 'mainnet'
            // const hardfork = opts.hardfork ? opts.hardfork : null
            // this._common = new Common(chain, hardfork)
            this._common = utils_1.common;
        }
        const fields = [
            {
                name: 'parentHash',
                length: 32,
                allowZero: true,
                default: utils.zeros(32),
            }, {
                name: 'number',
                allowZero: true,
                default: utils.toBuffer(0),
            }, {
                name: 'incomingTransactionsIndex',
                length: 32,
                allowLess: true,
                allowZero: true,
                default: utils.zeros(32),
            }, {
                name: 'incomingTransactionsCount',
                length: 32,
                allowLess: true,
                allowZero: true,
                default: utils.zeros(32),
            }, {
                name: 'transactionsCount',
                length: 32,
                allowLess: true,
                allowZero: true,
                default: utils.zeros(32),
            }, {
                name: 'transactionsRoot',
                length: 32,
                allowZero: true,
                default: utils.zeros(32),
            }, {
                name: 'stateRoot',
                length: 32,
                allowZero: true,
                default: utils.zeros(32),
            }, {
                name: 'exitsRoot',
                length: 32,
                allowZero: false,
                default: buffer_1.Buffer.from('2def10d13dd169f550f578bda343d9717a138562e0093b380a1120789d53cf10', 'hex'),
            }, {
                name: 'coinbase',
                length: 20,
                allowZero: true,
                default: utils.zeros(20),
            }, {
                name: 'timestamp',
                allowZero: true,
                default: buffer_1.Buffer.from([]),
            },
        ];
        utils.defineProperties(this, fields, data);
        if (data.commitment) {
            this._commitment = new commitment_1.CommitmentHeader(data.commitment);
        }
        abi_1.setEncodeABI(abi_1.HeaderABI, this);
    }
    get encodedLength() {
        return 320;
    }
    /**
     * Validates the gasLimit.
     *
     * @param parentBlock - this block's parent
     */
    // validateGasLimit(parentBlock: Block): boolean {
    //   const pGasLimit = new BN(parentBlock.header.gasLimit)
    //   const gasLimit = new BN(this.gasLimit)
    //   const hardfork = this._getHardfork()
    //   const a = pGasLimit.div(
    //     new BN(this._common.param('gasConfig', 'gasLimitBoundDivisor', hardfork)),
    //   )
    //   const maxGasLimit = pGasLimit.add(a)
    //   const minGasLimit = pGasLimit.sub(a)
    //   return (
    //     gasLimit.lt(maxGasLimit) &&
    //     gasLimit.gt(minGasLimit) &&
    //     gasLimit.gte(this._common.param('gasConfig', 'minGasLimit', hardfork))
    //   )
    // }
    get commitment() {
        return this._commitment;
    }
    toConfirmedBlockQuery() {
        return { blockHash: this.hash(), blockNumber: this.number };
    }
    toCommitment(commitData) {
        this._commitment = new commitment_1.CommitmentHeader(Object.assign({ header: this }, commitData));
        return this._commitment;
    }
    /**
     * Validates the entire block header, throwing if invalid.
     *
     * @param blockchain - the blockchain that this block is validating against
     */
    async validate(blockchain) {
        if (this.isGenesis()) {
            return;
        }
        const parentBlock = await this._getBlockByHash(blockchain, this.parentHash);
        if (parentBlock === undefined) {
            throw new Error('could not find parent block');
        }
        const number = new ethereumjs_util_1.BN(this.number);
        if (number.cmp(new ethereumjs_util_1.BN(parentBlock.header.number).iaddn(1)) !== 0) {
            throw new Error('invalid number');
        }
        if (utils.bufferToInt(this.timestamp) <= utils.bufferToInt(parentBlock.header.timestamp)) {
            throw new Error('invalid timestamp');
        }
    }
    /**
     * Returns the hash of the block header.
     */
    hash() {
        return keccak256(ethereumjs_util_1.toBuffer(this.encodeABI()));
    }
    /**
     * Checks if the block header is a genesis header.
     */
    isGenesis() {
        return this.number.length === 0;
    }
    /**
     * Turns the header into the canonical genesis block header.
     */
    setGenesisParams() {
        this.parentHash = utils_1.toBuf(0, 32);
        this.number = utils_1.toBuf(0, 32);
        this.incomingTransactionsIndex = utils_1.toBuf(0, 32);
        this.incomingTransactionsCount = utils_1.toBuf(0, 32);
        this.transactionsCount = utils_1.toBuf(0, 32);
        this.transactionsRoot = utils_1.toBuf(0, 32);
        this.exitsRoot = buffer_1.Buffer.from('2def10d13dd169f550f578bda343d9717a138562e0093b380a1120789d53cf10', 'hex');
        this.coinbase = utils_1.toBuf(0, 20);
        this.timestamp = utils_1.toBuf(0, 32);
        this.stateRoot = buffer_1.Buffer.from('4b529be809997a3bb9e6aac629611bfe00c51044f4cb112a8b9b4ac7eab5c19a', 'hex');
    }
    /**
     * Returns the rlp encoding of the block header
     */
    serialize() {
        // Note: This never gets executed, defineProperties overwrites it.
        return buffer_1.Buffer.from([]);
    }
    /* Temporary replacement for the toJSON function - did not completely replace it to avoid needing to update dependents. */
    encodeJSON() {
        return {
            parentHash: ethereumjs_util_1.bufferToHex(this.parentHash),
            number: ethereumjs_util_1.bufferToHex(this.number),
            incomingTransactionsIndex: ethereumjs_util_1.bufferToHex(this.incomingTransactionsIndex),
            incomingTransactionsCount: ethereumjs_util_1.bufferToHex(this.incomingTransactionsCount),
            transactionsCount: ethereumjs_util_1.bufferToHex(this.transactionsCount),
            transactionsRoot: ethereumjs_util_1.bufferToHex(this.transactionsRoot),
            stateRoot: ethereumjs_util_1.bufferToHex(this.stateRoot),
            exitsRoot: ethereumjs_util_1.bufferToHex(this.exitsRoot),
            coinbase: ethereumjs_util_1.bufferToHex(this.coinbase),
            timestamp: ethereumjs_util_1.bufferToHex(this.timestamp),
            commitment: this.commitment ? this.commitment.encodeJSON() : undefined
        };
    }
    /**
     * Returns the block header in JSON format
     *
     * @see {@link https://github.com/ethereumjs/ethereumjs-util/blob/master/docs/index.md#defineproperties|ethereumjs-util}
     */
    toJSON(_labels = false) {
        return {};
    }
    _getHardfork() {
        const commonHardFork = this._common.hardfork();
        return commonHardFork !== null
            ? commonHardFork
            : this._common.activeHardfork(utils.bufferToInt(this.number));
    }
    async _getBlockByHash(blockchain, hash) {
        return new Promise((resolve, reject) => {
            blockchain.getBlock(hash, (err, block) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(block);
            });
        });
    }
}
exports.BlockHeader = BlockHeader;
BlockHeader.decodeABI = abi_1.getDecodeABI(abi_1.HeaderABI, BlockHeader);
