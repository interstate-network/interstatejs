// import SignedTransaction from "./signed";
// import IncomingTransaction from "./incoming";
// import { bufferToHex } from "web3x/utils";
// import { IncomingTransactionJson, SignedTransactionJson } from "./types";
// import { toBuffer, rlp } from "ethereumjs-util";
// import { Transaction, FakeTransaction } from ".";

// /* export function fromRlp(params: any): Transaction {
//   let fields: Buffer | Buffer[];
//   if (typeof params == 'string') fields = rlp.decode(toBuffer(params));
//   else if (Buffer.isBuffer(params)) fields = rlp.decode(params);
//   else if (Array.isArray(params)) fields = params;
//   else if ((typeof params === "undefined" ? "undefined" : typeof params) === "object") {
//     const keys = Object.keys(params);
//     if (keys.indexOf('sourceBlock') !== -1) return new IncomingTransaction(params);
//     if (keys.indexOf('v') !== -1) return new SignedTransaction(params);
//     return new FakeTransaction(params);
//   }
//   else throw new Error('Could not interpret decode input.')

//   if (fields.length == 9) return new SignedTransaction(fields);
//   if (fields.length == 7) return new IncomingTransaction(fields);
//   return new FakeTransaction(fields);
// }
//  */
// export class SignedTransactionSerializer {
//   static decode(json: SignedTransactionJson): SignedTransaction {
//     return new SignedTransaction(json);
//   }

//   static encode(tx: SignedTransaction): SignedTransactionJson {
//     return {
//       nonce: bufferToHex(tx.nonce),
//       gasLimit: bufferToHex(tx.gasLimit),
//       gasPrice: bufferToHex(tx.gasPrice),
//       to: bufferToHex(tx.to),
//       value: bufferToHex(tx.value),
//       data: bufferToHex(tx.data),
//       v: bufferToHex(tx.v),
//       r: bufferToHex(tx.r),
//       s: bufferToHex(tx.s),
//     }
//   }
// }

// export class IncomingTransactionSerializer {
//   static decode(json: IncomingTransactionJson): IncomingTransaction {
//     return new IncomingTransaction(json);
//   }

//   static encode(tx: IncomingTransaction): IncomingTransactionJson {
//     return {
//       sourceBlock: bufferToHex(tx.sourceBlock),
//       itxIndex: bufferToHex(tx.itxIndex),
//       from: bufferToHex(tx.from),
//       to: bufferToHex(tx.to),
//       gasLimit: bufferToHex(tx.gasLimit),
//       value: bufferToHex(tx.value),
//       data: bufferToHex(tx.data)
//     }
//   }
// }