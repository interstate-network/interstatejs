module.exports = {
  compilers: {
    solc: {
      version: '^0.6.0',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '50005'
    },
    with_mocks: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '50005'
    }
  }
};
