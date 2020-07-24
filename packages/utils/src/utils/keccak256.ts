import createKeccakHash from "keccak";

export function keccak256(a: string | Buffer): Buffer {
  return createKeccakHash(`keccak256`)
    .update(a)
    .digest();
};

export function hashConcat(a: Buffer, b: Buffer): Buffer {
  return keccak256(Buffer.concat([ a, b ]));
}

export default keccak256;