"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateTrie = exports.StorageTrie = exports.TrieWrapper = exports.Trie = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const ethereumjs_account_1 = __importDefault(require("ethereumjs-account"));
const Trie = require('merkle-patricia-tree/secure');
exports.Trie = Trie;
const to_1 = require("./to");
const emptyStorageRoot = ethereumjs_util_1.toBuffer('0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421');
const proofLib = require('./proof-lib');
class TrieWrapper {
    constructor(trie) {
        this.get = (key) => this.lib.get(key);
        this.put = (key, val) => this.lib.put(key, val);
        this.del = (key) => this.lib.del(key);
        this.prove = (key) => this.lib.prove(key);
        this.checkpoint = () => this.trie.checkpoint();
        this.commit = () => this.trie.commit();
        this.revert = () => this.trie.revert();
        if (!trie)
            trie = new Trie();
        this.trie = trie;
        this.lib = proofLib(trie);
    }
    static fromDB(db, rootHash) {
        const trie = new Trie(db, rootHash);
        return new TrieWrapper(trie);
    }
    get root() { return this.trie.root; }
}
exports.TrieWrapper = TrieWrapper;
class StorageTrie extends TrieWrapper {
    constructor() {
        super(...arguments);
        this.get = (key) => this.lib.get(to_1.toBuf32(key)).then((v) => ethereumjs_util_1.rlp.decode(v));
        this.put = async (key, value) => {
            return await this.lib.put(to_1.toBuf32(key), ethereumjs_util_1.rlp.encode(ethereumjs_util_1.toBuffer(value)));
        };
        this.prove = (key) => this.lib.prove(to_1.toBuf32(key));
    }
}
exports.StorageTrie = StorageTrie;
class StateTrie extends TrieWrapper {
    async getAccount(address) {
        let buf = Buffer.isBuffer(address) ? address : ethereumjs_util_1.toBuffer(address);
        const val = await this.lib.get(buf).catch((err) => null);
        return new ethereumjs_account_1.default(val || undefined);
    }
    static fromDB(db, rootHash) {
        const trie = new Trie(db, rootHash);
        return new StateTrie(trie);
    }
    async getAccountCode(address) {
        const account = await this.getAccount(address);
        return new Promise((resolve, reject) => account.getCode(this.trie, (err, code) => (err) ? reject(err) : resolve(code)));
    }
    async putAccount(address, account) {
        let buf = Buffer.isBuffer(address) ? address : ethereumjs_util_1.toBuffer(address);
        await this.lib.put(buf, account.serialize());
    }
    async getAccountProof(address) {
        let buf = Buffer.isBuffer(address) ? address : ethereumjs_util_1.toBuffer(address);
        return this.lib.prove(buf);
    }
    async getAccountStorageTrie(address) {
        const account = await this.getAccount(address);
        let trie;
        if (account.stateRoot.equals(emptyStorageRoot)) {
            trie = new Trie();
        }
        else {
            trie = this.trie.copy();
            trie.root = account.stateRoot;
            trie._checkpoints = [];
        }
        return new StorageTrie(trie);
    }
    async getAccountStorageProof(address, key) {
        const trie = await this.getAccountStorageTrie(address);
        const value = await trie.get(key);
        const proof = await trie.prove(key);
        return { value, proof };
    }
}
exports.StateTrie = StateTrie;
