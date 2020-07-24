"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tree = require('functional-red-black-tree');
const account_1 = __importDefault(require("@interstatejs/account"));
class Cache {
    constructor(tree) {
        this._cache = Tree();
        this._checkpoints = [];
        this._tree = tree;
    }
    put(key, val, fromTree = false) {
        const modified = !fromTree;
        this._update(key, val, modified, false);
    }
    get(key) {
        let account = this.lookup(key);
        if (!account) {
            account = new account_1.default();
        }
        return account;
    }
    lookup(key) {
        const keyStr = key.toString('hex');
        const it = this._cache.find(keyStr);
        if (it.node) {
            const account = new account_1.default(it.value.val);
            return account;
        }
    }
    async _lookupAccount(address) {
        const raw = await this._tree.getLeaf(address);
        const account = new account_1.default(raw);
        return account;
    }
    async getOrLoad(key) {
        let account = this.lookup(key);
        if (!account) {
            account = await this._lookupAccount(key);
            this._update(key, account, false, false);
        }
        return account;
    }
    async warm(addresses) {
        for (const addressHex of addresses) {
            if (addressHex) {
                const address = Buffer.from(addressHex, 'hex');
                const account = await this._lookupAccount(address);
                this._update(address, account, false, false);
            }
        }
    }
    async flush() {
        const it = this._cache.begin;
        let next = true;
        while (next) {
            console.log('editing key ', it.key);
            if (!it.key || it.key.length == 0) {
                next = it.hasNext;
                it.next();
            }
            else if (it.value && it.value.modified) {
                it.value.modified = false;
                it.value.val = it.value.val.serialize();
                await this._tree.update(Buffer.from(it.key, 'hex'), it.value.val);
                next = it.hasNext;
                it.next();
            }
            else if (it.value && it.value.deleted) {
                it.value.modified = false;
                it.value.deleted = false;
                it.value.val = new account_1.default().serialize();
                await this._tree.delete(Buffer.from(it.key, 'hex'));
                next = it.hasNext;
                it.next();
            }
            else {
                next = it.hasNext;
                it.next();
            }
        }
    }
    checkpoint() {
        this._checkpoints.push(this._cache);
    }
    revert() {
        this._cache = this._checkpoints.pop();
    }
    commit() {
        this._checkpoints.pop();
    }
    clear() {
        this._cache = Tree();
    }
    del(key) {
        this._update(key, new account_1.default(), false, true);
    }
    _update(key, val, modified, deleted) {
        const keyHex = key.toString('hex');
        const it = this._cache.find(keyHex);
        if (it.node) {
            this._cache = it.update({
                val: val,
                modified: modified,
                deleted: deleted,
            });
        }
        else {
            this._cache = this._cache.insert(keyHex, {
                val: val,
                modified: modified,
                deleted: deleted,
            });
        }
    }
}
exports.default = Cache;
//# sourceMappingURL=cache.js.map