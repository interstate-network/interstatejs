/// <reference types="node" />
export default class Bloom {
    bitvector: Buffer;
    constructor(bitvector?: Buffer);
    add(e: Buffer): void;
    check(e: Buffer): boolean;
    multiCheck(topics: Buffer[]): boolean;
    or(bloom: Bloom): void;
}
