// Create a byte string of some length in bytes. It repeats the value provided until the
// string hits that length
export function makeRepeatedBytes(value: string, length: number): string {
  const repeated = value.repeat((length * 2) / value.length + 1)
  const sliced = repeated.slice(0, length * 2)
  return '0x' + sliced
}

/**
 * Converts a buffer to a hex string.
 * @param buf the buffer to be converted.
 * @returns the buffer as a string.
 */
export const bufToHexString = (buf: Buffer): string => {
  return '0x' + buf.toString('hex')
}

/**
 * Converts a hex string to a buffer
 * @param hexString the hex string to be converted
 * @returns the hexString as a buffer.
 */
export const hexStrToBuf = (hexString: string): Buffer => {
  return Buffer.from(remove0x(hexString), 'hex')
}

/**
 * Removes "0x" from start of a string if it exists.
 * @param str String to modify.
 * @returns the string without "0x".
 */
export const remove0x = (str: string): string => {
  return str.startsWith('0x') ? str.slice(2) : str
}