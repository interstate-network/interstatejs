import BN from 'bn.js';
import { toBuffer, setLengthLeft, bufferToHex, bufferToInt } from 'ethereumjs-util';

export type BufferLike = string | number | Buffer | BN | { toBuffer(): Buffer };
export const isHex = (str: string): boolean => Boolean(/[xabcdef]/g.exec(str));

export const toBn = (value: BufferLike): BN => {
  if (BN.isBN(value)) return value as BN;
  if (typeof value == 'number') return new BN(value);
  if (typeof value == 'string') return new BN(value, isHex(value) ? 'hex' : undefined);
  if (Buffer.isBuffer(value)) return new BN(value);
}

export const toInt = (value: BufferLike): number => {
  if (typeof value == 'number') return value;
  if (typeof value == 'string') {
    if (isHex(value)) return parseInt(value, 16);
    return +value;
  }
  if (Buffer.isBuffer(value)) return bufferToInt(value);
  if (BN.isBN(value)) return value.toNumber();
  return bufferToInt(value.toBuffer());
}

export const toHex = (value: BufferLike): string => {
  if (typeof value == 'number') return toPrefixed(value.toString(16));
  if (typeof value == 'string') {
    if (isHex(value)) return toPrefixed(value);
    return toPrefixed((+value).toString(16));
  }
  if (Buffer.isBuffer(value)) return bufferToHex(value);
  if (BN.isBN(value)) return toPrefixed(value.toString('hex'));
  if (value.toBuffer) return bufferToHex(value.toBuffer ());
  throw new Error(`Did not recognize input type: ${value}.`);
}

export const toBuf = (value: BufferLike, length?: number): Buffer => {
  const buf = toBuffer(typeof value == 'string' ? toHex(value) : value);
  return (length) ? setLengthLeft(buf, length) : buf;
}

export const toBuf32 = (value: BufferLike): Buffer => {
  const buf = toBuffer(value);
  if (buf.byteLength == 32) return buf;
  return toBn(buf).toArrayLike(Buffer, 'be', 32);
}

export const toNonPrefixed = (str: string) => {
  if (str.slice(0, 2) == '0x') return str.slice(2);
  return str;
}

export const toPrefixed = (str: string): string => {
  if (str.slice(0, 2) == '0x') return str;
  return `0x${str}`;
}

export const sliceBuffer = (buf: Buffer, index: number, length?: number): Buffer => {
  const len = length || buf.byteLength - index;
  const copy = Buffer.alloc(len);
  buf.copy(copy, 0, index, index + len);
  return copy;
}

export const copyBuffer = (buf: Buffer): Buffer => {
  if (buf == undefined) return undefined;
  return sliceBuffer(buf, 0, buf.length);
}

export { setLengthLeft }