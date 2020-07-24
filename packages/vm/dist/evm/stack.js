"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const ethereumjs_util_1 = require("ethereumjs-util");
const { ERROR, VmError } = require('../exceptions');
class Stack {
    constructor() {
        this._store = [];
    }
    get length() {
        return this._store.length;
    }
    push(value) {
        if (!BN.isBN(value)) {
            throw new VmError(ERROR.INTERNAL_ERROR);
        }
        if (value.gt(ethereumjs_util_1.MAX_INTEGER)) {
            throw new VmError(ERROR.OUT_OF_RANGE);
        }
        if (this._store.length > 1023) {
            throw new VmError(ERROR.STACK_OVERFLOW);
        }
        this._store.push(value);
    }
    pop() {
        if (this._store.length < 1) {
            throw new VmError(ERROR.STACK_UNDERFLOW);
        }
        return this._store.pop();
    }
    popN(num = 1) {
        if (this._store.length < num) {
            throw new VmError(ERROR.STACK_UNDERFLOW);
        }
        if (num === 0) {
            return [];
        }
        return this._store.splice(-1 * num).reverse();
    }
    swap(position) {
        if (this._store.length <= position) {
            throw new VmError(ERROR.STACK_UNDERFLOW);
        }
        const head = this._store.length - 1;
        const i = this._store.length - position - 1;
        const tmp = this._store[head];
        this._store[head] = this._store[i];
        this._store[i] = tmp;
    }
    dup(position) {
        if (this._store.length < position) {
            throw new VmError(ERROR.STACK_UNDERFLOW);
        }
        const i = this._store.length - position;
        this.push(this._store[i]);
    }
}
exports.default = Stack;
//# sourceMappingURL=stack.js.map