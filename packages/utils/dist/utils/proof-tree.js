"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageTree = exports.StateTree = exports.encodeSparseMerkleProof = exports.SparseMerkleProofABI = void 0;
const sparse_merkle_tree_1 = __importDefault(require("@interstatejs/sparse-merkle-tree"));
const ethereumjs_util_1 = require("ethereumjs-util");
const account_1 = __importDefault(require("@interstatejs/account"));
const to_1 = require("./to");
const keccak256_1 = require("./keccak256");
const ABI = require('web3-eth-abi');
/*
const storageTrie = await this._tree.subTree(address, undefined, 256)
*/
/**
 * This structure is not very efficient.
 * We could probably improve it by using the RLP length for
 * serialized accounts to locate the beginning of the siblings
 * array, and slicing the first 32 bytes for storage proofs.
 */
exports.SparseMerkleProofABI = {
    StateProof: {
        inclusionBits: 'uint256',
        value: 'bytes',
        siblings: 'bytes32[]'
    }
};
function encodeSparseMerkleProof(proof) {
    return to_1.toHex(ABI.encodeParameter(exports.SparseMerkleProofABI, {
        value: proof.value,
        inclusionBits: proof.inclusionBits,
        siblings: proof.siblings
    }));
}
exports.encodeSparseMerkleProof = encodeSparseMerkleProof;
class StateTree {
    constructor(_tree) {
        this._tree = _tree;
    }
    get root() {
        return this._tree.rootHash;
    }
    checkpoint() {
        return this._tree.checkpoint();
    }
    async commit() {
        return this._tree.commit();
    }
    async revert() {
        return this._tree.revert();
    }
    static async create(db, rootHash) {
        const tree = await sparse_merkle_tree_1.default.create(db, rootHash, 160);
        return new StateTree(tree);
    }
    async isContract(address) {
        const account = await this.getAccount(address);
        return account.isContract();
    }
    async getAccount(_address) {
        const address = Buffer.isBuffer(_address) ? _address : ethereumjs_util_1.toBuffer(_address);
        const val = await this._tree.getLeaf(address);
        return new account_1.default(val);
    }
    async getAccountCode(address) {
        const account = await this.getAccount(address);
        if (!account.isContract()) {
            return Buffer.alloc(0);
        }
        const code = await this._tree.getRaw(account.codeHash);
        return code || Buffer.alloc(0);
    }
    async putAccountCode(_address, _code) {
        const address = Buffer.isBuffer(_address) ? _address : ethereumjs_util_1.toBuffer(_address);
        const code = Buffer.isBuffer(_code) ? _code : ethereumjs_util_1.toBuffer(_code);
        const codeHash = keccak256_1.keccak256(code);
        await this._tree.putRaw(codeHash, code);
        const account = await this.getAccount(address);
        account.codeHash = codeHash;
        await this.putAccount(address, account);
    }
    async putAccount(_address, account) {
        const address = Buffer.isBuffer(_address) ? _address : ethereumjs_util_1.toBuffer(_address);
        await this._tree.update(address, account.serialize());
    }
    async getAccountProof(_address) {
        const address = Buffer.isBuffer(_address) ? _address : ethereumjs_util_1.toBuffer(_address);
        const proof = await this._tree.getSparseMerkleProof(address);
        return encodeSparseMerkleProof(proof);
    }
    async getAccountStorageTrie(_address) {
        const address = Buffer.isBuffer(_address) ? _address : ethereumjs_util_1.toBuffer(_address);
        const account = await this.getAccount(address);
        const storageTree = await this._tree.subTree(address, account.stateRoot, 256);
        return new StorageTree(storageTree);
    }
    async getAccountStorageProof(address, key) {
        const trie = await this.getAccountStorageTrie(address);
        const value = await trie.get(key);
        const proof = await trie.prove(key);
        return { value, proof };
    }
}
exports.StateTree = StateTree;
class StorageTree {
    constructor(_tree) {
        this._tree = _tree;
    }
    get root() {
        return this._tree.rootHash;
    }
    async get(key) {
        const value = await this._tree.getLeaf(to_1.toBuf32(key));
        if (value == undefined)
            return Buffer.alloc(0);
        return value;
    }
    async put(key, value) {
        await this._tree.update(to_1.toBuf32(key), ethereumjs_util_1.toBuffer(value));
    }
    async prove(key) {
        const proof = await this._tree.getSparseMerkleProof(to_1.toBuf32(key));
        return encodeSparseMerkleProof(proof);
    }
}
exports.StorageTree = StorageTree;
