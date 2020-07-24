// import IncomingTransaction from "./incoming";
// import SignedTransaction from "./signed";
// import { BufferLike, PrefixedHexString } from "./types";
// import Transaction from "./transaction";
// import { bufferToHex, toBuffer } from "ethereumjs-util";
// import UnionTransaction from "./union";
// import { encodeRollupTransaction } from "./rollup";

// export interface RollupTransactionData {
//   sourceBlock?: BufferLike
//   itxIndex?: BufferLike
//   gasLimit?: BufferLike
//   gasPrice?: BufferLike
//   from?: BufferLike
//   to?: BufferLike
//   nonce?: BufferLike
//   data?: BufferLike
//   v?: BufferLike
//   r?: BufferLike
//   s?: BufferLike
//   value?: BufferLike
//   root?: BufferLike
//   stateRoot?: BufferLike
//   tx?: Transaction
// }

// export function decodeItxRollup(data: PrefixedHexString): RollupTransactionData {
//   const dataBuf = (data.slice(0, 2) == '0x') ? Buffer.from(data.slice(2), 'hex') : Buffer.from(data, 'hex');
//   let sourceBlock = dataBuf.slice(0, 16);
//   let itxIndex = dataBuf.slice(16, 32);
//   let stateRoot = dataBuf.slice(32, 64);
//   return {
//     sourceBlock,
//     itxIndex,
//     stateRoot
//   };
// }

// export default class RollupTransaction {
//   tx?: Transaction;
//   stateRoot?: Buffer;

//   constructor(data: Buffer | PrefixedHexString | RollupTransactionData) {
//     let dataStr: string | null = null;
//     if (Buffer.isBuffer(data)) dataStr = bufferToHex(data);
//     else if (typeof data == 'string') dataStr = data;
//     else if (typeof data == 'object') {
//       if (data.tx) this.tx = data.tx;
//       else this.tx = new UnionTransaction(data);
//       this.stateRoot = data.stateRoot ? toBuffer(data.stateRoot) : toBuffer(data.root);
//     }
//     if (dataStr) {
//       if (dataStr.length == 130) {
//         let {sourceBlock, itxIndex, stateRoot} = decodeItxRollup(dataStr);
//         this.tx = new IncomingTransaction({ sourceBlock, itxIndex });
//         this.stateRoot = <Buffer> stateRoot;
//       }
//       else {
//         let ptr = dataStr.length - 64;
//         let txData = dataStr.slice(0, ptr);
//         this.tx = new SignedTransaction(txData);
//         this.stateRoot = Buffer.from(dataStr.slice(ptr), 'hex');
//       }
//     }
//   }

//   toJSON() {
//     if (!this.tx) throw new Error('Transaction not set - can not encode rollup.');
//     if (!this.stateRoot) throw new Error('State root not set - can not encode rollup.');
//     return {
//       ...this.tx.toJSON(true),
//       stateRoot: bufferToHex(this.stateRoot)
//     }
//   }

//   encodeRollup() {
//     if (!this.tx) throw new Error('Transaction not set - can not encode rollup.');
//     if (!this.stateRoot) throw new Error('State root not set - can not encode rollup.');
//     return encodeRollupTransaction(this.tx, this.stateRoot);
//   }
// }