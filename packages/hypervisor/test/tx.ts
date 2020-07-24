import { IncomingTransaction, SignedTransaction } from '@interstatejs/tx';
import BN from 'bn.js';
import { BufferLike } from '@interstatejs/utils';

const gas = 6e6;
const gasPrice = 1;

const defaultPrivateKey = Buffer.from(
  'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
  'hex',
);

const vmAddress = Buffer.from(
  '696e74657273746174652d312d6d616368696e65', // interstate-1-machine
  'hex'
);

export type GetTxOpts = {
  from?: Buffer;
  to?: Buffer;
  data?: BufferLike;
  value?: number | string | BN;
  incoming?: boolean;
}

/* from must be a private key */
export const toTx = (opts: GetTxOpts) => {
  const { from, to, data, value, incoming } = opts;
  let tx;
  if (!to || incoming) {
    tx = new IncomingTransaction({
      from: from || vmAddress,
      to,
      data,
      gasLimit: gas
    });
  }
  else {
    tx = new SignedTransaction({ to, data, value, gasLimit: gas, gasPrice });
    tx.sign(from || defaultPrivateKey);
  }
  return {
    skipNonce: true,
    skipBalance: true,
    tx,
  }
};
