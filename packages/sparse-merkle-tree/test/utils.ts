import crypto = require("crypto");

export const randomHexBuffer = (size: number) => {
  return crypto.randomBytes(size);
}

export const randomInt = (max: number = 100) => {
  return Math.floor(Math.random() * max) + 1;
}