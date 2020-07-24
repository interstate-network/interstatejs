import createKeccakHash = require('keccak');

export function keccak256(a: Buffer): Buffer {
  return createKeccakHash(`keccak256`)
    .update(a)
    .digest();
};

/**
 * Returns the hash of the concatenated buffers.
 *
 * @param left Left item to hash
 * @param right Right item to hash
 */
export const hashConcat = (left: Buffer, right: Buffer): Buffer => keccak256(
  Buffer.concat([ left, right ])
);