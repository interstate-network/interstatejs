import Common from 'ethereumjs-common';

const options = {
  name: 'interstate',
  network_id: 50005,
  chain_id: 50005,
  hardfork: "istanbul",
  hardforks: ['byzantium', 'constantinople', 'petersburg', 'istanbul']
};

export const common = Common.forCustomChain(
  "mainnet", // TODO needs to match chain id
  {
    name: options.name,
    networkId: options.network_id,
    chainId: options.chain_id,
    comment: "Local test network",
    bootstrapNodes: []
  },
  options.hardfork,
  options.hardforks
);