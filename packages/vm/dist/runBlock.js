"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const rlp_1 = require("rlp");
const bloom_1 = __importDefault(require("./bloom"));
const validationErrors_1 = require("./validationErrors");
const ethereumjs_util_1 = require("ethereumjs-util");
const promisify = require('util.promisify');
const Trie = require('merkle-patricia-tree');
async function runBlock(opts) {
    if (opts === undefined) {
        throw new Error('invalid input, opts must be provided');
    }
    if (!opts.block) {
        throw new Error('invalid input, block must be provided');
    }
    const state = this.stateManager;
    const block = opts.block;
    const generateStateRoot = !!opts.generate;
    await this._emit('beforeBlock', opts.block);
    if (opts.root) {
        await state.setStateRoot(opts.root);
    }
    await state.checkpoint();
    let result;
    try {
        result = await applyBlock.bind(this)(block, opts.skipBlockValidation);
    }
    catch (err) {
        await state.revert();
        throw err;
    }
    await state.commit();
    const stateRoot = await state.getStateRoot();
    const exitsRoot = await state.getExitsRoot(ethereumjs_util_1.bufferToInt(opts.block.header.number));
    if (generateStateRoot) {
        block.header.exitsRoot = exitsRoot;
        block.setOutputs();
        block.header.stateRoot = stateRoot;
    }
    else {
        if (stateRoot.toString('hex') !== block.header.stateRoot.toString('hex')) {
            throw new validationErrors_1.BlockStateRootError();
        }
        if (exitsRoot.toString('hex') !== block.header.exitsRoot.toString('hex')) {
            throw new validationErrors_1.BlockExitsRootError();
        }
    }
    await this._emit('afterBlock', {
        receipts: result.receipts,
        results: result.results,
    });
    if (result.results) {
        for (let i = 0; i < result.results.length; i++) {
            const tx = block.transactions[i];
            const root = result.results[i].stateRoot;
            let buf = root.toBuffer();
            if (generateStateRoot) {
                tx.stateRoot = buf;
            }
            else {
                if (tx.stateRoot) {
                    if (buf.toString('hex') !== tx.stateRoot.toString('hex')) {
                        throw new validationErrors_1.TransactionStateError(i);
                    }
                }
            }
        }
    }
    return { receipts: result.receipts, results: result.results };
}
exports.default = runBlock;
async function applyBlock(block, skipBlockValidation = false) {
    const txResults = await applyTransactions.bind(this)(block);
    return txResults;
}
async function applyTransactions(block) {
    const bloom = new bloom_1.default();
    let gasUsed = new BN(0);
    const receiptTrie = new Trie();
    const receipts = [];
    const txResults = [];
    for (let txIdx = 0; txIdx < block.transactions.length; txIdx++) {
        const tx = block.transactions[txIdx];
        const txRes = await this.runTx({
            tx: tx,
            block: block,
        });
        txResults.push(txRes);
        gasUsed = gasUsed.add(txRes.gasUsed);
        bloom.or(txRes.bloom);
        const txReceipt = {
            status: txRes.execResult.exceptionError ? 0 : 1,
            gasUsed: gasUsed.toArrayLike(Buffer),
            bitvector: txRes.bloom.bitvector,
            logs: txRes.execResult.logs || [],
        };
        receipts.push(txReceipt);
        await promisify(receiptTrie.put).bind(receiptTrie)(rlp_1.encode(txIdx), rlp_1.encode(Object.values(txReceipt)));
    }
    return {
        bloom,
        gasUsed,
        receiptRoot: receiptTrie.root,
        receipts,
        results: txResults,
    };
}
//# sourceMappingURL=runBlock.js.map