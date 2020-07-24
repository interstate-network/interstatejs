import { Address } from 'web3x/address';
import { BlockHeaderJson, CommitmentHeaderQuery, BlockHeader } from "@interstatejs/block";
import { BufferLike, toHex } from '@interstatejs/utils';
import { IncomingTransaction } from '@interstatejs/tx';
import { isEqual } from '../auditor/witness-auditors/helpers';

export function convertHeaderForWeb3x(header: BlockHeader | BlockHeaderJson) {
  let json: BlockHeaderJson;
  if (header instanceof BlockHeader) json = header.encodeJSON();
  else json = header;
  return {
    ...json,
    coinbase: Address.fromString(json.coinbase)
  }
}

export function convertCommitmentQueryForWeb3x(query: CommitmentHeaderQuery) {
  return {
    ...query,
    commitment: {
      ...query.commitment,
      coinbase: Address.fromString(query.commitment.coinbase)
    }
  }
}

export function convertAddressForWeb3x(address: BufferLike): Address {
  let str = address && toHex(address);
  if (!str || str == '0x') str = `0x${'00'.repeat(20)}`;
  return Address.fromString(str);
}

export function convertIncomingTransactionForWeb3x(tx: IncomingTransaction) {
  const isDeployment = !tx.to || tx.to.length == 0 || isEqual(tx.to, 0);
  // if  (isDeployment) {
  //   console.log({
  //     from: convertAddressForWeb3x(tx.from),
  //     to: convertAddressForWeb3x(tx.to),
  //     gas: toHex(tx.gasLimit),
  //     value: toHex(tx.value),
  //     data: isDeployment ? '0x' : toHex(tx.data),
  //     stateRoot: toHex(tx.stateRoot)
  //   })
  // }
  return {
    from: convertAddressForWeb3x(tx.from),
    to: convertAddressForWeb3x(tx.to),
    gas: toHex(tx.gasLimit),
    value: toHex(tx.value),
    data: isDeployment ? '0x' : toHex(tx.data),
    stateRoot: toHex(tx.stateRoot)
  }
}