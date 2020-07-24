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

export const NULL_BUFFER = Buffer.alloc(32, 0);