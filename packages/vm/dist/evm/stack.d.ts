import BN = require('bn.js');
export default class Stack {
    _store: BN[];
    constructor();
    get length(): number;
    push(value: BN): void;
    pop(): BN;
    popN(num?: number): BN[];
    swap(position: number): void;
    dup(position: number): void;
}
