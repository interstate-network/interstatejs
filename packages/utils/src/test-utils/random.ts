import crypto = require("crypto");
import { privateToAddress, setLengthRight, unpad } from 'ethereumjs-util';
import { toHex, toInt } from '../utils/to';

export function randomHexString(size) {
  const bytes = crypto.randomBytes(size);
  return toHex(
    setLengthRight(unpad(bytes), size)
  );
}

export function randomHexBuffer(size) {
  const bytes = crypto.randomBytes(size);
  return setLengthRight(unpad(bytes), size);
  // const bytes = randomHexString(size);
  // return Buffer.from(bytes.slice(2), "hex");
}

export const randomAccount = () => {
  let privateKey = randomHexBuffer(32);
  let address = toHex(privateToAddress(privateKey));
  return { privateKey, address };
};

export const randomInt = (bytes) => {
  return toInt(randomHexBuffer(bytes));
}

export const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
