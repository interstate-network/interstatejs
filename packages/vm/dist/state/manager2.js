"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const account_1 = __importDefault(require("@interstatejs/account"));
const ethereumjs_util_1 = require("ethereumjs-util");
const utils_1 = require("@interstatejs/utils");
const utils_2 = require("@interstatejs/utils");
const precompiles_1 = require("../evm/precompiles");
class DefaultStateManager {
    constructor(opts) {
        this._common = opts.common || utils_1.common;
        this._tree = new utils_2.StateTree(opts.tree);
        this._storageTries = {};
        this._touched = new Set();
        this._touchedStack = [];
        this._checkpointCount = 0;
        this._originalStorageCache = new Map();
    }
    async forceGetStateRoot() {
        return this._tree.root;
    }
    async getAccount(address) {
        const account = await this._tree.getAccount(address);
        return account;
    }
    async putAccount(address, account) {
        await this._tree.putAccount(address, account);
        this.touchAccount(address);
    }
    touchAccount(address) {
        this._touched.add(address.toString('hex'));
    }
    async putContractCode(address, value) {
        const codeHash = ethereumjs_util_1.keccak256(value);
        if (codeHash.equals(ethereumjs_util_1.KECCAK256_NULL)) {
            return;
        }
        await this._tree.putAccountCode(address, value);
    }
    async getContractCode(address) {
        return this._tree.getAccountCode(address);
    }
    async _lookupStorageTrie(address) {
        const storageTrie = (await this._tree.getAccountStorageTrie(address))._tree;
        return storageTrie;
    }
    async _getStorageTrie(address) {
        let storageTrie = this._storageTries[address.toString('hex')];
        if (!storageTrie) {
            storageTrie = await this._lookupStorageTrie(address);
        }
        return storageTrie;
    }
    async getContractStorage(address, key) {
        if (key.length !== 32) {
            throw new Error('Storage key must be 32 bytes long');
        }
        const trie = await this._getStorageTrie(address);
        const value = await trie.getLeaf(key);
        return value;
    }
    async getOriginalContractStorage(address, key) {
        if (key.length !== 32) {
            throw new Error('Storage key must be 32 bytes long');
        }
        const addressHex = address.toString('hex');
        const keyHex = key.toString('hex');
        let map;
        if (!this._originalStorageCache.has(addressHex)) {
            map = new Map();
            this._originalStorageCache.set(addressHex, map);
        }
        else {
            map = this._originalStorageCache.get(addressHex);
        }
        if (map.has(keyHex)) {
            return map.get(keyHex);
        }
        else {
            const current = await this.getContractStorage(address, key);
            map.set(keyHex, current);
            return current;
        }
    }
    _clearOriginalStorageCache() {
        this._originalStorageCache = new Map();
    }
    async _modifyContractStorage(address, modifyTrie) {
        return new Promise(async (resolve) => {
            const storageTrie = await this._getStorageTrie(address);
            modifyTrie(storageTrie, async () => {
                this._storageTries[address.toString('hex')] = storageTrie;
                const contract = await this._tree.getAccount(address);
                contract.stateRoot = storageTrie.rootHash;
                await this.putAccount(address, contract);
                this.touchAccount(address);
                resolve();
            });
        });
    }
    async putContractStorage(address, key, value) {
        if (key.length !== 32) {
            throw new Error('Storage key must be 32 bytes long');
        }
        await this._modifyContractStorage(address, async (storageTrie, done) => {
            if (value && value.length) {
                await storageTrie.update(key, value);
            }
            else {
                await storageTrie.delete(key);
            }
            done();
        });
    }
    async clearContractStorage(address) {
        await this._modifyContractStorage(address, async (storageTrie, done) => {
            await storageTrie.setRoot(storageTrie.EMPTY_ROOT);
            done();
        });
    }
    async checkpoint() {
        this._tree.checkpoint();
        this._touchedStack.push(new Set(Array.from(this._touched)));
        this._checkpointCount++;
    }
    async commit() {
        this._touchedStack.pop();
        this._checkpointCount--;
        await this._tree.commit();
    }
    async revert() {
        this._storageTries = {};
        const touched = this._touchedStack.pop();
        if (!touched) {
            throw new Error('Reverting to invalid state checkpoint failed');
        }
        if (this._touched.has(precompiles_1.ripemdPrecompileAddress)) {
            touched.add(precompiles_1.ripemdPrecompileAddress);
        }
        this._touched = touched;
        this._checkpointCount--;
        await this._tree.revert();
    }
    async getStateRoot() {
        if (this._checkpointCount !== 0) {
            throw new Error('Cannot get state root with uncommitted checkpoints');
        }
        const stateRoot = this._tree.root;
        return stateRoot;
    }
    async setStateRoot(stateRoot) {
        if (this._checkpointCount !== 0) {
            throw new Error('Cannot set state root with uncommitted checkpoints');
        }
        if (stateRoot === this._tree._tree.EMPTY_ROOT) {
            await this._tree._tree.setRoot(stateRoot);
            this._storageTries = {};
            return;
        }
        const hasRoot = await this._tree._tree.checkRoot(stateRoot);
        if (!hasRoot) {
            throw new Error('State trie does not contain state root');
        }
        await this._tree._tree.setRoot(stateRoot);
        this._storageTries = {};
    }
    async hasGenesisState() {
        const root = this._common.genesis().stateRoot;
        return await this._tree._tree.checkRoot(root);
    }
    async generateCanonicalGenesis() {
        if (this._checkpointCount !== 0) {
            throw new Error('Cannot create genesis state with uncommitted checkpoints');
        }
    }
    async generateGenesis(initState) {
        if (this._checkpointCount !== 0) {
            throw new Error('Cannot create genesis state with uncommitted checkpoints');
        }
        const addresses = Object.keys(initState);
        for (const address of addresses) {
            const account = new account_1.default();
            if (initState[address].slice(0, 2) === '0x') {
                account.balance = new ethereumjs_util_1.BN(initState[address].slice(2), 16).toArrayLike(Buffer);
            }
            else {
                account.balance = new ethereumjs_util_1.BN(initState[address]).toArrayLike(Buffer);
            }
            const addressBuffer = ethereumjs_util_1.toBuffer(address);
            await this._tree._tree.update(addressBuffer, account.serialize());
        }
    }
    async accountIsEmpty(address) {
        const account = await this.getAccount(address);
        return account.isEmpty();
    }
    async cleanupTouchedAccounts() {
        const touchedArray = Array.from(this._touched);
        for (const addressHex of touchedArray) {
            const address = Buffer.from(addressHex, 'hex');
            const empty = await this.accountIsEmpty(address);
            if (empty) {
                await this._tree._tree.delete(address);
            }
        }
        this._touched.clear();
    }
}
exports.default = DefaultStateManager;
//# sourceMappingURL=manager2.js.map