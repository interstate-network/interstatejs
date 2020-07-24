import { addHexPrefix, BN, toBuffer, bufferToInt } from "ethereumjs-util";
import { toHex, toBn } from '@interstatejs/utils';
import { VmError, ERROR } from '@interstatejs/vm/lib/exceptions';
const ABI = require('web3-eth-abi');

export const outgoingTransactionParams = [
  /* from, to, gas, value, data, bounty  */
  'address', 'address', 'uint256', 'uint256', 'bytes', 'uint256'
];

export type OutgoingTransactionOptions = {
  from: Buffer,
  to: Buffer,
  gasLimit?: BN,
  value: BN,
  data?: Buffer,
  bounty?: BN
}

const wordCeiling = (value: number, ceiling: number = 32): number => {
  const r = value % ceiling
  if (r === 0) {
    return value
  } else {
    return value + ceiling - r
  }
}

const relayFunctions = {
  withdraw: {
    signature: ABI.encodeFunctionSignature('withdraw()'),
    params: []
  },
  withdrawWithBounty: {
    signature: ABI.encodeFunctionSignature('withdraw(uint256)'),
    params: ['uint256']
  },
  addTransaction: {
    signature: ABI.encodeFunctionSignature('addTransaction(address,bytes)'),
    params: ['address', 'bytes']
  },
  addTransactionWithBounty: {
    signature: ABI.encodeFunctionSignature(
      'addTransactionWithBounty(address,bytes,uint256)'
    ),
    params: ['address', 'bytes', 'uint256']
  }
};

export function outgoingTransactionFromCallInputs(
  fullCalldata: Buffer,
  caller: Buffer,
  value: BN,
  gas: BN
): OutgoingTransaction {
  const fnSig = addHexPrefix(fullCalldata.subarray(0, 4).toString('hex'));
  const calldata = fullCalldata.subarray(4);
  let tx: OutgoingTransaction;
  let inputs: any[];
  let bounty: BN;
  switch (fnSig) {
    case relayFunctions.withdraw.signature:
      if (calldata.length != 0) throw new VmError(ERROR.INVALID_OPCODE);
      tx = new OutgoingTransaction({
        from: caller,
        to: caller,
        value: value,
      });
      break;
    case relayFunctions.withdrawWithBounty.signature:
      if (calldata.length != 32) throw new VmError(ERROR.INVALID_OPCODE);
      inputs = ABI.decodeParameter('uint256', calldata);
      bounty = toBn(inputs[0]);
      if (value.lt(bounty)) {
        throw new VmError(ERROR.INSUFFICIENT_VALUE_FOR_BOUNTY);
      }
      tx = new OutgoingTransaction({
        from: caller,
        to: caller,
        value: value.sub(bounty),
        bounty,
        data: Buffer.alloc(0)
      });
      break;
    case relayFunctions.addTransaction.signature:
      try {
        inputs = ABI.decodeParameters(relayFunctions.addTransaction.params, calldata);
      } catch (err) {
        throw new VmError(ERROR.INVALID_OPCODE);
      }
      tx = new OutgoingTransaction({
        from: caller,
        to: toBuffer(inputs[0]),
        data: toBuffer(inputs[1]),
        value: value
      });
      break;
    case relayFunctions.addTransactionWithBounty.signature:
      try {
        inputs = ABI.decodeParameters(
          relayFunctions.addTransactionWithBounty.params, calldata
        );
      } catch (err) {
        throw new VmError(ERROR.INVALID_OPCODE);
      }
      bounty = toBn(inputs[2]);
      if (value.lt(bounty)) {
        throw new VmError(ERROR.INSUFFICIENT_VALUE_FOR_BOUNTY);
      }
      tx = new OutgoingTransaction({
        from: caller,
        to: toBuffer(inputs[0]),
        data: toBuffer(inputs[1]),
        value: value.sub(bounty),
        bounty
      });
      break;
    default:
      throw new Error('Invalid function signature.');
  }
  let gasFee = tx.gasFee();
  if (gas.lt(gasFee)) {
    throw new VmError(ERROR.OUT_OF_GAS);
  }
  tx.gasLimit = gas.sub(gasFee);
  return tx;
}

export class OutgoingTransaction {
  /* Address that sent the outgoing transaction */
  public from!: Buffer;
  /* Address the transaction is sent to */
  public to!: Buffer;
  /* Amount of gas that must be sent on mainnet to execute the transaction */
  public gasLimit!: BN;
  /* Call value sent with the transaction */
  public value!: BN;
  /* Data sent with the transaction */
  public data!: Buffer;
  /* Optional payment to incentivize third parties to execute the tx on behalf of the caller */
  public bounty!: BN;

  constructor(opts: OutgoingTransactionOptions) {
    Object.assign(this, opts);
    if (!this.bounty) this.bounty = new BN(0);
    if (!this.gasLimit) this.gasLimit = new BN(0);
    if (!this.data) this.data = Buffer.alloc(0);
  }

  encode(): string {
    return ABI.encodeParameters(
      outgoingTransactionParams,
      [
        this.from,
        this.to,
        this.gasLimit,
        this.value,
        this.data,
        this.bounty
      ].map(toHex)
    );
  }

  /**
   * Calculates the gas fee for an outgoing transaction.
   * The gas fee is 10,000 as a base fee plus 10,000 for each word of data in
   * the encoded transaction.
   * Every transaction has 5 words for the fields from, to, gas, value, bounty,
   * so the total fee is calculated as tx.gas + 10,000 * (6 + wordCount(tx.data))
  */
  gasFee(): BN {
    const dataWords = wordCeiling(this.data.length) / 32;
    const words = 6 + dataWords;
    return new BN(10000).muln(words).add(this.gasLimit);
  }
}