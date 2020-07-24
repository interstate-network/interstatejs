"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const ethereumjs_account_1 = __importDefault(require("ethereumjs-account"));
const ethereumjs_blockchain_1 = __importDefault(require("ethereumjs-blockchain"));
const state_1 = require("./state");
const runCode_1 = __importDefault(require("./runCode"));
const runCall_1 = __importDefault(require("./runCall"));
const runTx_1 = __importDefault(require("./runTx"));
const runBlock_1 = __importDefault(require("./runBlock"));
const opcodes_1 = require("./evm/opcodes");
const runBlockchain_1 = __importDefault(require("./runBlockchain"));
const utils_1 = require("@interstatejs/utils");
const sparse_merkle_tree_1 = __importDefault(require("@interstatejs/sparse-merkle-tree"));
const promisify = require('util.promisify');
const AsyncEventEmitter = require('async-eventemitter');
__exportStar(require("./witness"), exports);
__exportStar(require("./exceptions"), exports);
class VM extends AsyncEventEmitter {
    constructor(opts = {}) {
        super();
        this.opts = opts;
        if (opts.common) {
            if (opts.chain || opts.hardfork) {
                throw new Error('You can only instantiate the VM class with one of: opts.common, or opts.chain and opts.hardfork');
            }
            this._common = opts.common;
        }
        else {
            this._common = utils_1.common;
        }
        this.relayAddress = utils_1.getChildRelayAddressFromCommon(this._common);
        this._opcodes = opcodes_1.getOpcodesForHF(this._common.hardfork());
        if (opts.stateManager) {
            this.stateManager = opts.stateManager;
        }
        else if (opts.state) {
            this.stateManager = new state_1.StateManager({ common: opts.common, tree: opts.state });
        }
        else {
            this.stateManager = new state_1.StateManager({ tree: new sparse_merkle_tree_1.default(undefined, undefined, 160) });
        }
        this.blockchain = opts.blockchain || new ethereumjs_blockchain_1.default({ common: this._common });
        this.allowUnlimitedContractSize =
            opts.allowUnlimitedContractSize === undefined ? false : opts.allowUnlimitedContractSize;
        this.produceWitness =
            opts.produceWitness === undefined ? false : opts.produceWitness;
        this._emit = promisify(this.emit.bind(this));
    }
    static async create(opts) {
        let stateManager;
        if (opts.stateManager) {
            stateManager = opts.stateManager;
        }
        else {
            const tree = opts.state || await sparse_merkle_tree_1.default.create(undefined, undefined, 160);
            if (opts.activatePrecompiles) {
                for (let i = 1; i <= 8; i++) {
                    await tree.update(new BN(i).toArrayLike(Buffer, 'be', 20), new ethereumjs_account_1.default().serialize());
                }
            }
            stateManager = new state_1.StateManager({ common: opts.common, tree });
        }
        return new VM(Object.assign(Object.assign({}, opts), { stateManager }));
    }
    runBlockchain(blockchain) {
        return runBlockchain_1.default.bind(this)(blockchain);
    }
    runBlock(opts) {
        return runBlock_1.default.bind(this)(opts);
    }
    runTx(opts) {
        return runTx_1.default.bind(this)(opts);
    }
    runCall(opts) {
        return runCall_1.default.bind(this)(opts);
    }
    runCode(opts) {
        return runCode_1.default.bind(this)(opts);
    }
}
exports.default = VM;
//# sourceMappingURL=index.js.map