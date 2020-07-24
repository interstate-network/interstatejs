// import { Eth } from 'web3x/eth';
// import { Address } from 'web3x/address';
// import { WebsocketProvider } from 'web3x/providers';
// import { Contract } from 'web3x/contract';
import BN from 'bn.js';
const Web3 = require('web3');
const ganache = require("ganache-core");
const linker = require("solc/linker");

export async function getWeb3() {
  // ganache.provider()
  let web3 = new Web3(ganache.provider());
  // new Eth(new WebsocketProvider('ws://localhost:8545'));
  const accounts = await web3.eth.getAccounts();
  const [from] = accounts;
  // const networkID = await web3.getId();
  return {
    accounts,
    from,
    web3,
    // networkID
  };
}

type DeploymentsRecord = {
  [key: string]: {
    [key: string]: any
  }
}

const contractFields = ({
  abi,
  evm: {
    bytecode: { object: bytecode, linkReferences }
  }
}) => ({ abi, bytecode, linkReferences });

const toContractFields = (options, file, name) =>
  contractFields(options.contracts[file][name]);

const toFileName = (s: string): string => `${s.replace(".sol", "")}.sol`;
const toContractName = (s: string): string => s.replace(".sol", "");

export class Deployer {
  deployments: DeploymentsRecord = {};
  constructor(public web3, public from, public contracts: any) {}

  toContractFields(file: string, contract: string) {
    const fileRef = toFileName(file);
    if (!this.contracts[fileRef]) throw new Error(`${fileRef} not found in contracts`);
    if (!this.contracts[fileRef][contract]) throw new Error(`[${fileRef}][${contract}] not found in contracts`)
    return toContractFields({ contracts: this.contracts }, fileRef, contract)
  }

  async deployAndLinkRecursive(file: string, contract: string, returnData?: boolean): Promise<any> {
    let { bytecode, linkReferences } = this.toContractFields(file, contract);
    if (linkReferences) {
      const fileRefKeys = Object.keys(linkReferences);
      let addrMap = {};
      for (let fileRef of fileRefKeys) {
        addrMap[fileRef] = {};
        if (!this.deployments[fileRef]) this.deployments[fileRef] = {};
        const contractRefKeys = Object.keys(this.contracts[fileRef]);
        for (let contractRef of contractRefKeys) {
          if (this.deployments[fileRef][contractRef])
            addrMap[fileRef][contractRef] = this.deployments[fileRef][contractRef];
          else {
            let addr = await this.deployAndLinkRecursive(fileRef, contractRef);
            if (typeof addr == "object") addr = addr.options.address;
            this.deployments[fileRef][contractRef] = addr;
            addrMap[fileRef][contractRef] = addr;
          }
        }
      }
      bytecode = linker.linkBytecode(bytecode, addrMap);
      this.contracts[toFileName(file)][toContractName(contract)].evm.bytecode = { object: bytecode, linkReferences: {} };
    }
    if (returnData) return bytecode;
    return this.deploy(file, contract);
  }

  async deploy(
    file: string, contract?: string, value?: string | number, args?: Array<any>
  ): Promise<any> {
    if (!contract) contract = toContractName(file);
    let { abi, bytecode, linkReferences } = this.toContractFields(file, contract);
    if (Object.keys(linkReferences).length) {
      bytecode = await this.deployAndLinkRecursive(file, contract, true);
    }
    if (!bytecode) {
      throw new Error(`Could not find bytecode for ${contract} in ${file}`);
    }
    if (bytecode.slice(0, 2) != "0x") bytecode = `0x${bytecode}`;
    if (abi) {
      const contract = new this.web3.eth.Contract(abi);
      return contract.deploy({
        data: bytecode,
        arguments: args || []
      }).send({ from: this.from, gas: 6e6, value });
    }
    const tx = await this.web3.eth.sendTransaction({
      from: this.from,
      data: bytecode,
      value
    });
    return tx.contractAddress;
  }
}