import { ErrorProof } from "../proof-types";
import { toBuffer, rlp, BN } from "ethereumjs-util";
import { toBn } from "@interstatejs/utils";
import { BufferLike } from "@interstatejs/tx";

export const emptyStorageRoot = toBuffer('0xa9a4da177ac3f81cfe85a6767678aabb095aa306e72ab73f5cf0559c56d0a530');
export const emptyCodeHash = toBuffer('0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470');

export const encode = (value: Buffer | BN) => rlp.encode(value);
export const decode = (value: Buffer) => rlp.decode(value);

export const isEqual = (a: BufferLike, b: BufferLike): boolean => toBn(a).eq(toBn(b));

export class ProvableError extends Error {
  constructor(public error: ErrorProof) {
    super('Caught provable error.');
  }
}