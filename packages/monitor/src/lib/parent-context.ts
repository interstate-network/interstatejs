import { Address } from "web3x/address";
import { Eth } from "web3x/eth";
import { generateAddress2, toBuffer } from 'ethereumjs-util';
import {
  ChainPeg,
  ParentRelay,
  ChallengeManager,
  AccessErrorProver,
  BlockErrorProver,
  ExecutionErrorProver,
  TransactionErrorProver,
  EncodingErrorProver,
  WitnessErrorProver
} from "@interstatejs/contracts";

const getContractJson = (name: string) => require(`@interstatejs/contracts/build/contracts/${name}.json`);

export function getContractAddress(name: string, networkID: number): Address {
  const contractJSON = getContractJson(name);
  const address = contractJSON.networks[networkID].address;
  if (!address) throw new Error(`Address not found for contract ${name} on network ${networkID}`);
  return Address.fromString(address);
}

export interface ContractData {
  pegAddress: Address;
  relayAddress: Address;
  archiveFactoryAddress: Address;
  archiveInitializerCode: string;
  challengeManagerAddress: Address;
  accessErrorProverAddress: Address;
  blockErrorProverAddress: Address;
  executionErrorProverAddress: Address;
  transactionErrorProverAddress: Address;
  encodingErrorProverAddress: Address;
}

export class ParentContext {
  public peg: ChainPeg;
  public relay: ParentRelay;
  public challengeManager: ChallengeManager;
  public accessErrorProver: AccessErrorProver;
  public blockErrorProver: BlockErrorProver;
  public executionErrorProver: ExecutionErrorProver;
  public transactionErrorProver: TransactionErrorProver;
  public encodingErrorProver: EncodingErrorProver;
  public witnessErrorProver: WitnessErrorProver;

  constructor(
    public eth: Eth,
    public networkID: number,
    pegAddress: Address,
    relayAddress: Address,
    public archiveFactoryAddress: Address,
    public archiveInitializerCode: string,
    challengeManagerAddress: Address,
    accessErrorProverAddress: Address,
    blockErrorProverAddress: Address,
    executionErrorProverAddress: Address,
    transactionErrorProverAddress: Address,
    encodingErrorProverAddress: Address,
    witnessErrorProverAddress: Address
  ) {
    this.peg = new ChainPeg(eth, pegAddress);
    this.relay = new ParentRelay(eth, relayAddress);
    this.challengeManager = new ChallengeManager(eth, challengeManagerAddress);
    this.accessErrorProver = new AccessErrorProver(eth, accessErrorProverAddress);
    this.blockErrorProver = new BlockErrorProver(eth, blockErrorProverAddress);
    this.executionErrorProver = new ExecutionErrorProver(eth, executionErrorProverAddress);
    this.transactionErrorProver = new TransactionErrorProver(eth, transactionErrorProverAddress);
    this.encodingErrorProver = new EncodingErrorProver(eth, encodingErrorProverAddress);
    this.witnessErrorProver = new WitnessErrorProver(eth, witnessErrorProverAddress)
  }

  static async fromBuildOutput(eth: Eth): Promise<ParentContext> {
    const networkID = await eth.getId();
    return new ParentContext(
      eth,
      networkID,
      getContractAddress('ChainPeg', networkID),
      getContractAddress('ParentRelay', networkID),
      getContractAddress('ArchiveFactory', networkID),
      getContractJson('ArchiveInitializer').bytecode,
      getContractAddress('ChallengeManager', networkID),
      getContractAddress('AccessErrorProver', networkID),
      getContractAddress('BlockErrorProver', networkID),
      getContractAddress('ExecutionErrorProver', networkID),
      getContractAddress('TransactionErrorProver', networkID),
      getContractAddress('EncodingErrorProver', networkID),
      getContractAddress('WitnessErrorProver', networkID)
    );
  }

  getArchiveAddress(proxyAddress: Address): Address {
    const salt = proxyAddress.toBuffer32();
    return new Address(generateAddress2(
      this.archiveFactoryAddress.toBuffer(), salt, toBuffer(`0x${this.archiveInitializerCode}`)
    ));
  }

  async getArchivedCode(address: Address, isRelay?: boolean): Promise<string> {
    const queryAddress = isRelay ? this.getArchiveAddress(address) : address;
    return this.eth.getCode(queryAddress).then(
      (code) => `0x${code.slice(4)}`
    );
  }
}

