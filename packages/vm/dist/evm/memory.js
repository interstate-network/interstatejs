"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
class Memory {
    constructor() {
        this._store = [];
    }
    extend(offset, size) {
        if (size === 0) {
            return;
        }
        const newSize = ceil(offset + size, 32);
        const sizeDiff = newSize - this._store.length;
        if (sizeDiff > 0) {
            this._store = this._store.concat(new Array(sizeDiff).fill(0));
        }
    }
    write(offset, size, value) {
        if (size === 0) {
            return;
        }
        assert_1.default(value.length === size, 'Invalid value size');
        assert_1.default(offset + size <= this._store.length, 'Value exceeds memory capacity');
        assert_1.default(Buffer.isBuffer(value), 'Invalid value type');
        for (let i = 0; i < size; i++) {
            this._store[offset + i] = value[i];
        }
    }
    read(offset, size) {
        const loaded = this._store.slice(offset, offset + size);
        for (let i = loaded.length; i < size; i++) {
            loaded[i] = 0;
        }
        return Buffer.from(loaded);
    }
}
exports.default = Memory;
const ceil = (value, ceiling) => {
    const r = value % ceiling;
    if (r === 0) {
        return value;
    }
    else {
        return value + ceiling - r;
    }
};
//# sourceMappingURL=memory.js.map