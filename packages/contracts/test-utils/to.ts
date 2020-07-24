import { toBuffer, setLengthLeft, bufferToHex, bufferToInt, BN } from 'ethereumjs-util';

export type BufferLike = string | number | Buffer | BN;

export function isHex(value: any, length?: number): boolean {
  if (typeof value !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false;
  }
  if (length && value.length !== 2 + 2 * length) {
    return false;
  }
  return true;
}

export const toInt = (value: BufferLike): number => {
  if (typeof value == 'number') return value;
  if (typeof value == 'string') {
    if (value.slice(0, 2) == '0x') return parseInt(value, 16);
    return +value;
  }
  if (Buffer.isBuffer(value)) return bufferToInt(value);
  if (BN.isBN(value)) return value.toNumber();
  throw new Error('Did not recognize type.');
}

export const toHex = (value: BufferLike): string => {
  if (typeof value == 'number') return toPrefixed(value.toString(16));
  if (typeof value == 'string') {
    if (isHex(value)) return value;
    return toHex(toBuf(value));
  }
  if (Buffer.isBuffer(value)) {
    const str = toPrefixed(bufferToHex(value));
    if (str == '0x') return '0x00';
    return str;
  }
  if (BN.isBN(value)) {
    const buf = toBuf(value);
    return toHex(buf);
  }
  throw new Error('Did not recognize type.');
}

export const toBuf = (value: BufferLike, length?: number): Buffer => {
  const buf = toBuffer(value);
  return (length) ? setLengthLeft(buf, length) : buf;
}

export const toNonPrefixed = (str: string) => {
  if (str.slice(0, 2) == '0x') return str.slice(2);
  return str;
}

export const toPrefixed = (str: string): string => {
  if (str.slice(0, 2) == '0x') return str;
  return `0x${str}`;
}

export const sliceBuffer = (buf: Buffer, index: number, length: number): Buffer => {
  const copy = Buffer.alloc(length);
  buf.copy(copy, index, index + length);
  return copy;
}

export type Bufferish = BufferLike | {[key: string]: Bufferish} | Array<Bufferish>
// export type BufferishArray = Array<BufferLike | BufferishMap>
// export type BufferishMap = { [key: string]: BufferLike | BufferishMap };

export const isBufferLike = (t: any) => {
  return (typeof t == 'string') || (typeof t == 'number') || BN.isBN(t) || Buffer.isBuffer(t) || t['toBuffer'] != undefined;
}

export const toUsable = (obj: Bufferish) => {
  if (obj == undefined) throw new Error(`obj undefined`)
  if (isBufferLike(obj)) return toHex(<BufferLike> obj);
  if (Array.isArray(obj)) return obj.map(o => toUsable(o));
  return Object.keys(obj).reduce((ret, k) => {
    return {
      ...ret,
      [k]: toUsable(obj[k])
    }
  }, {})
}