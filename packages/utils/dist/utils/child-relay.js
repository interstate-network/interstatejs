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
exports.ChildRelay = exports.getChildRelayAddressFromCommon = exports.decodeRootNode = exports.encodeRootNode = void 0;
const sparse_merkle_tree_1 = require("@interstatejs/sparse-merkle-tree");
const ethereumjs_util_1 = require("ethereumjs-util");
const keccak256_1 = __importStar(require("./keccak256"));
const proof_tree_1 = require("./proof-tree");
const to_1 = require("./to");
const common_1 = require("../common");
const ABI = require('web3-eth-abi');
const RootNodeAbi = {
    RootNode: {
        root: 'uint256',
        length: 'uint16'
    }
};
exports.encodeRootNode = ({ root, length }) => {
    return ethereumjs_util_1.toBuffer(ABI.encodeParameter(RootNodeAbi, { root, length }));
};
exports.decodeRootNode = (data) => {
    if (data.length == 0)
        return { root: ethereumjs_util_1.toBuffer(sparse_merkle_tree_1.DEFAULT_ROOT_16), length: 0 };
    const decoded = ABI.decodeParameter(RootNodeAbi, data);
    return {
        root: ethereumjs_util_1.toBuffer(decoded.root),
        length: +decoded.length
    };
};
/**
 * Calculate the child relay address by taking the first 20 bytes of the
 * hash of the chain ID padded to 32 bytes.
 * @param common ethereum common for the chain
 */
function getChildRelayAddressFromCommon(_common = common_1.common) {
    return to_1.sliceBuffer(keccak256_1.default(to_1.toBuf32(_common.chainId())), 0, 20);
}
exports.getChildRelayAddressFromCommon = getChildRelayAddressFromCommon;
class ChildRelay {
    constructor(stateTree, storageTree, transactionsTree, rootNode, height, address) {
        this.stateTree = stateTree;
        this.storageTree = storageTree;
        this.transactionsTree = transactionsTree;
        this.rootNode = rootNode;
        this.height = height;
        this.address = address;
    }
    get root() {
        return this.rootNode.root;
    }
    get length() {
        return this.rootNode.length;
    }
    get rootKey() {
        return keccak256_1.default(to_1.toBuf32(this.height));
    }
    get stateRoot() {
        return this.stateTree.root;
    }
    static async create(stateTree, address, height) {
        const storageTree = await stateTree.getAccountStorageTrie(address);
        const heightBuf = Buffer.from(height.toString(16), 'hex');
        const rootKey = keccak256_1.default(heightBuf);
        const root = exports.decodeRootNode(await storageTree.get(rootKey));
        const prefix = keccak256_1.hashConcat(Buffer.from("EXITS_RELAY"), Buffer.from(height.toString(16), 16));
        const transactionsTree = await storageTree._tree.subTree(prefix, root.root, 16);
        return new ChildRelay(stateTree, storageTree, transactionsTree, root, height, address);
    }
    async getRootProof() {
        const accountProof = await this.stateTree.getAccountProof(this.address);
        const storageProof = await this.storageTree.prove(this.rootKey);
        return { accountProof, storageProof };
    }
    async getUpdateProof() {
        const accountProof = await this.stateTree.getAccountProof(this.address);
        const storageProof = await this.storageTree.prove(this.rootKey);
        const transactionProof = proof_tree_1.encodeSparseMerkleProof(await this.transactionsTree.getSparseMerkleProof(ethereumjs_util_1.toBuffer(this.length)));
        return {
            accountProof,
            storageProof,
            transactionProof
        };
    }
    async updateRootNode() {
        await this.storageTree.put(this.rootKey, exports.encodeRootNode(this.rootNode));
        const account = await this.stateTree.getAccount(this.address);
        account.stateRoot = this.storageTree.root;
        await this.stateTree.putAccount(this.address, account);
    }
    async insert(transaction) {
        await this.transactionsTree.update(ethereumjs_util_1.toBuffer(this.length), transaction);
        this.rootNode.length += 1;
        this.rootNode.root = this.transactionsTree.rootHash;
        await this.storageTree.put(this.rootKey, exports.encodeRootNode(this.rootNode));
        const account = await this.stateTree.getAccount(this.address);
        account.stateRoot = this.storageTree.root;
        await this.stateTree.putAccount(this.address, account);
    }
    getTransaction(index) {
        if (index >= this.length) {
            throw new Error('Transaction index out of range');
        }
        return this.transactionsTree.getLeaf(ethereumjs_util_1.toBuffer(index));
    }
    getTransactionProof(index) {
        if (index >= this.length) {
            throw new Error('Transaction index out of range');
        }
        return this.transactionsTree.getSparseMerkleProof(ethereumjs_util_1.toBuffer(index));
    }
}
exports.ChildRelay = ChildRelay;
