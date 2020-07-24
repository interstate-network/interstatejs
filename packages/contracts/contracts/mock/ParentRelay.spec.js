const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const path = require('path');
const { getWeb3, getMerkleRoot, compile, deploy, randomHexBuffer, getMerkleProof, TestBlockUtil } = require('@interstatejs/utils');

chai.use(chaiAsPromised);

const srcPath = path.join(__dirname, '..');
const pegPath = path.join(srcPath, 'peg');
const testPath = path.join(__dirname, 'testData');

const eth10 = '0x8ac7230489e80000';
const eth1 = '0xde0b6b3a7640000';

const otxABI = {
  "OutgoingTransaction": {
    "from": "address",
    "to": "address",
    "gas": "uint256",
    "value": "uint256",
    "data": "bytes",
    "bounty": "uint256"
  }
};

describe('ParentRelay.sol', () => {
  let web3, from, testContract,
    mockRelay, archiveFactory,
    receiver1, receiver2, testProxy,
    receiveCallData;

  async function deployReceivers() {
    let contracts = compile(testPath, 'TestReceiver');
    receiver1 = await deploy(web3, from, { contracts, name: 'TestReceiver' });
    contracts = compile(testPath, 'TestProxyReceiver');
    receiver2 = await deploy(web3, from, { contracts, name: 'TestProxyReceiver', arguments: [ testProxy ] });
  }

  async function deployArchiver() {
    const contracts = compile(pegPath, 'ArchiveFactory', pegPath);
    archiveFactory = await deploy(web3, from, { contracts, name: 'ArchiveFactory' });
  }

  async function deployRelay() {
    let contracts = compile(__dirname, 'MockParentRelay', srcPath);
    testContract = await deploy(web3, from, {
      contracts: contracts,
      name: 'MockParentRelay',
      value: eth10,
      arguments: ['0x' + '00'.repeat(20), archiveFactory.options.address]
    });
    let toDeploy = archiveFactory.options.address;
    const receipt = await testContract.methods.deployContract(toDeploy).send({ gas: 5e6, from });
    testProxy = receipt.events.TransactionSent.returnValues['0'].from;
  }

  before(async () => {
    const res = await getWeb3()
    web3 = res.web3;
    from = res.from;
    await deployArchiver();
    await deployRelay();
    await deployReceivers();
    receiveCallData = receiver1.methods.receiveCall().encodeABI();
  });

  let archiveTest, archiveInitHash;

  describe('ArchiveFactory', () => {
    before(async () => {
      const contracts = compile(testPath, 'TestArchive', srcPath);
      archiveTest = await deploy(web3, from, { contracts, name: 'TestArchive' });
      archiveInitHash = await archiveTest.methods.getInitCodeHash().call();
    });

    it('Should archive a contract with a leading zero byte', async () => {
      const receipt = await archiveTest.methods.doTest().send({ gas: 5e6, from });
      expect(receipt.status).to.be.true;
    });
  })

  describe('Contract Proxy', async () => {
    function getArchiveAddress(proxyAddress) {
      const archiveAddress = archiveFactory.options.address;
      return archiveTest.methods.getC2Address(archiveAddress, proxyAddress, archiveInitHash).call();
    }

    it('Deploys a contract proxy and archive', async () => {
      const addressToCopy = archiveFactory.options.address;
      const archivedAddress = await getArchiveAddress(testProxy);
      const codeMatches = await archiveTest.methods.checkCode(addressToCopy, archivedAddress).call();

      expect(codeMatches).to.be.true;

      await testContract.methods.callThroughProxy(
        testProxy,
        receiver2.options.address,
        5e6,
        receiveCallData
      ).send({ gas: 5e6, from });

      const _received = await receiver2.methods.hasReceived().call();
      expect(_received).to.eq(true);
      await receiver2.methods.reset().send({ gas: 5e6, from });
    })
  })

  describe('Outgoing Transactions', () => {
    const encodeOTX = (otx) => {
      const data = web3.eth.abi.encodeParameter(otxABI, otx);
      return Buffer.from(data.slice(2), 'hex');
    }

    function getReceiveOTX(_from, to, gas = 100000, value = 0) {
      const otx = {
        from: _from,
        to,
        gas,
        value,
        data: receiveCallData,
        bounty: eth1
      };
      const _encoded = encodeOTX(otx);
      const encoded = Buffer.from(_encoded.slice(2), 'hex');
      return { otx, encoded };
    }

    async function putOTX(blockNumber, _from, to, gas = 100000, value = 0) {
      const otx = { from: _from, to, gas, value, data: receiveCallData, bounty: eth1 };
      const encoded = encodeOTX(otx);
      const { root, siblings } = getMerkleProof([encoded], 0);
      await testContract.methods.putOutgoingTransaction(blockNumber, otx).send({ gas: 150000, from });
      return { otx, encoded, root, siblings };
    }

    it('Puts outgoing transaction in mock parent relay', async () => {
      const blockNumber = 0;
      const { otx, root, siblings } = await putOTX(blockNumber, from, receiver1.options.address);
      // await testContract.methods.putOutgoingTransaction(blockNumber, otx).send({ gas: 150000, from });
      const hasTx = await testContract.methods.hasOutgoingTransaction(otx, siblings, 0, blockNumber).call();
      expect(hasTx).to.eq(true);
      const exitRoot = await testContract.methods.getExitsRoot(blockNumber).call()
      expect(exitRoot).to.eq(`0x${root.toString('hex')}`);
    });

    it('Forwards a basic transaction', async () => {
      const blockNumber = 1;
      const { otx, siblings } = await putOTX(blockNumber, from, receiver1.options.address);
      // await testContract.methods.putOutgoingTransaction(blockNumber, otx).send({ gas: 150000, from });
      await testContract.methods.executeOutgoingTransaction(otx, siblings, 0, blockNumber).send({ gas: 5e6, from });
      const received = await receiver1.methods.hasReceived().call();
      expect(received).to.eq(true);
    });

    it('Forwards a transaction through a proxy', async () => {
      const blockNumber = 1;
      const { otx, siblings } = await putOTX(blockNumber, testProxy, receiver2.options.address);
      // await testContract.methods.putOutgoingTransaction(blockNumber, otx).send({ gas: 150000, from });
      const receipt = await testContract.methods.executeOutgoingTransaction(otx, siblings, 0, blockNumber).send({ gas: 500000, from });
      expect(Object.keys(receipt.events).length).to.eq(0);
      const received = await receiver2.methods.hasReceived().call();
      expect(received).to.eq(true);
    });
  })
})