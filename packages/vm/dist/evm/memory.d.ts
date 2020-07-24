/// <reference types="node" />
export default class Memory {
    _store: number[];
    constructor();
    extend(offset: number, size: number): void;
    write(offset: number, size: number, value: Buffer): void;
    read(offset: number, size: number): Buffer;
}
