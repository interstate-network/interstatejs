import {
  MessageWitness, SloadWitness, SstoreWitness,
  TimestampWitness, NumberWitness, CoinbaseWitness,
  CallWitness, CallCodeWitness, DelegateCallWitness,
  decodeMessageWitness, MessageWitnessAbi, decodeAccessRecord,
  ExtCodeSizeWitness, ExtCodeHashWitness, ExtCodeCopyWitness,
  BalanceWitness, SelfBalanceWitness, ChainidWitness, StaticCallWitness
} from '@interstatejs/vm';
import BN from 'bn.js';
import { toBuffer } from 'ethereumjs-util';
import { BufferLike, Transaction, IncomingTransaction, OutgoingTransaction, outgoingTransactionFromCallInputs } from '@interstatejs/tx';
import { Block, BlockHeaderJson } from '@interstatejs/block';
import Account from '@interstatejs/account';
import { StateTree, keccak256, common, getChildRelayAddressFromCommon, toBn, ChildRelay, toHex } from "@interstatejs/utils";
import {
  ErrorProof,
  TransactionInclusionProof,
  WitnessInclusionProof
} from '../proof-types';
import { ProvableError, isEqual, emptyStorageRoot, emptyCodeHash } from './helpers';
import { encodePreviousRootProof } from '../coder';
import { Database } from '../../db';
import { bufferToInt } from 'ethereumjs-util';
import { getPrecompile } from '@interstatejs/vm/dist/evm/precompiles';

const ABI = require('web3-eth-abi');

export class WitnessAuditor {
  recordIndex: number = 0;
  public childRelayAddress: Buffer;

  constructor(
    public db: Database,
    public block: Block,
    public state: StateTree,
    public transaction: Transaction,
    public transactionIndex: number,
    public witness: MessageWitness,
    public calculatedWitness: MessageWitness
  ) {
    this.childRelayAddress = getChildRelayAddressFromCommon();
  }

  checkAll: () => Promise<void>;

  fail(error: ErrorProof) {
    throw new ProvableError(error);
  }

  async getPreviousRootProof(): Promise<string> {
    if (this.transactionIndex == 0) {
      const parent = await this.db.getBlock(this.block.header.parentHash);
      return encodePreviousRootProof(parent.header);
    }
    const transaction = this.block.transactions[this.transactionIndex - 1];
    const siblings = this.block.proveTransaction(this.transactionIndex - 1);
    return encodePreviousRootProof({ transaction: transaction.toRollup(), siblings });
  }

  checkGasLimit() {
    if (this.witness.gasUsed.gt(this.witness.gasAvailable)) {
      this.fail({
        _type: 'WITNESS_GAS_EXCEEDED_ERROR',
        ...this.getWitnessProof()
      })
    }
  }

  checkOutputRoot() {
    let expectedRoot: Buffer;
    if (this.witness.state_access_list.length > 0) {
      for (let i = this.witness.state_access_list.length - 1; i >= 0; i--) {
        let record = this.witness.state_access_list[i];
        if (record.opcode.eqn(0x55)) {
          expectedRoot = toBuffer((record as SstoreWitness).stateRootLeave);
          break;
        } else if (record.opcode.eqn(0xf1)) {
          expectedRoot = toBuffer((record as CallWitness).stateRootLeave);
          break;
        } else if (record.opcode.eqn(0xf2)) {
          expectedRoot = toBuffer((record as CallCodeWitness).stateRootLeave);
          break;
        } else if (record.opcode.eqn(0xf4)) {
          expectedRoot = toBuffer((record as DelegateCallWitness).stateRootLeave);
          break;
        }
      }
    } else {
      expectedRoot = toBuffer(this.witness.stateRootEnter);
    }
    if (!isEqual(expectedRoot, this.witness.stateRootLeave)) {
      this.fail({
        _type: 'OUTPUT_STATE_ROOT',
        ...this.getWitnessProof()
      });
    }
  }

  async checkAccessList() {
    for (; this.recordIndex < this.witness.state_access_list.length; this.recordIndex++) {
      const record = this.witness.state_access_list[this.recordIndex];
      switch(record.opcode.toNumber()) {
        case 0x31: await this.checkBalance(); break;
        case 0x3b: await this.checkExtCodeSize(); break;
        case 0x3c: await this.checkExtCodeCopy(); break;
        case 0x3f: await this.checkExtCodeHash(); break;
        case 0x41: await this.checkCoinbase(); break;
        case 0x42: await this.checkTimestamp(); break;
        case 0x43: await this.checkNumber(); break;
        case 0x46: await this.checkChainId(); break;
        case 0x47: await this.checkSelfBalance(); break;
        case 0x54: await this.checkSload(); break;
        case 0x55: await this.checkSstore(); break;
        case 0xf1: await this.checkCall(); break;
        case 0xfa: await this.checkStaticCall(); break;
      }
    }
  }

  get header(): BlockHeaderJson { return this.block.header.encodeJSON(); }
  get caller(): BufferLike { return this.witness.caller; }
  get context(): BufferLike { return this.witness.context; }

  getAccount = (address: BufferLike) => this.state.getAccount(address);
  putAccount = (address: BufferLike, account: Account) => this.state.putAccount(address , account);
  getAccountProof = (address: BufferLike): Promise<string> => this.state.getAccountProof(address);

  getTransactionProof = (): TransactionInclusionProof => {
    let txBytes: BufferLike | IncomingTransaction;
    if (this.transaction.isIncoming) txBytes = <IncomingTransaction> this.transaction;
    else txBytes = this.transaction.toRollup();
    return {
      transaction: txBytes,
      transactionIndex: this.transactionIndex,
      siblings: this.block.proveTransaction(this.transactionIndex)
    }
  };

  getWitnessProof = (): WitnessInclusionProof => ({
    commitmentQuery: this.block.header.commitment.query,
    transactionIndex: this.transactionIndex,
    messageWitness: this.witness.encode()
  });
  

  checkRefund() {
    const refund = this.witness.state_access_list.filter(
      access => access.opcode.eqn(0x55)
    ).reduce((sum, access) => sum.add((access as SstoreWitness).refund), new BN(0));
    /* results.gasUsed = results.gasUsed.add(basefee)
    // Process any gas refund
    results.gasRefund = results.execResult.gasRefund
    if (results.gasRefund) {
      if (results.gasRefund.lt(results.gasUsed.divn(2))) {
        results.gasUsed.isub(results.gasRefund)
      } else {
        results.gasUsed.isub(results.gasUsed.divn(2))
      }
    }
    results.amountSpent = results.gasUsed.mul(new BN(tx.gasPrice)) */
    if (!this.witness.refund.eq(refund)) {
      this.fail({
        _type: 'WITNESS_REFUND',
        ...this.getWitnessProof()
      })
    }
  }

  async checkCoinbase() {
    const record = <CoinbaseWitness> this.witness.state_access_list[this.recordIndex];
    if (!isEqual(record.coinbase, this.block.header.coinbase)) {
      this.fail({
        _type: 'COINBASE',
        ...this.getWitnessProof(),
        recordIndex: this.recordIndex
      });
    }
  }

  async checkTimestamp() {
    const record = <TimestampWitness> this.witness.state_access_list[this.recordIndex];
    if (!toBuffer(record.timestamp).equals(this.block.header.timestamp)) {
      this.fail({
        _type: 'TIMESTAMP',
        ...this.getWitnessProof(),
        header: this.header,
        recordIndex: this.recordIndex,
      });
    }
  }
  
  async checkNumber() {
    const record = <NumberWitness> this.witness.state_access_list[this.recordIndex];
    if (!toBuffer(record.number).equals(this.block.header.number)) {
      this.fail({
        _type: 'NUMBER',
        ...this.getWitnessProof(),
        recordIndex: this.recordIndex,
        header: this.header
      });
    }
  }

  async checkSload() {
    const record = <SloadWitness> this.witness.state_access_list[this.recordIndex];
    const account = await this.state.getAccount(this.context);
    const isEmpty = account.stateRoot.equals(emptyStorageRoot);
    if (isEmpty) {
      if (isEqual(record.value, new BN(0))) return;
      this.fail({
        _type: 'SLOAD',
        ...this.getWitnessProof(),
        recordIndex: this.recordIndex,
        accountProof: await this.getAccountProof(this.context),
        storageProof: ''
      });
    }
    const slot = record.slot;
    const storageTrie = await this.state.getAccountStorageTrie(this.context);
    const value = await storageTrie.get(slot);
    if (!isEqual(value, record.value)) {
      this.fail({
        _type: 'SLOAD',
        ...this.getWitnessProof(),
        recordIndex: this.recordIndex,
        accountProof: await this.getAccountProof(this.context),
        storageProof: await storageTrie.prove(slot)
      });
    }
  }

  async checkSstore() {
    const record = <SstoreWitness> this.witness.state_access_list[this.recordIndex];
    const account = await this.state.getAccount(this.context);
    const storageTrie = await this.state.getAccountStorageTrie(this.context);
    const oldValue = await storageTrie.get(record.slot);
    // const isEmpty = account.stateRoot.equals(emptyStorageRoot);
    let storageProof: string;
    const accountProof = await this.getAccountProof(this.context);
    storageProof = await storageTrie.prove(toBuffer(record.slot));
    const value = record.value;
    await storageTrie.put(record.slot, value);
    account.stateRoot = storageTrie.root;
    await this.state.putAccount(this.context, account);
    /* record.refund != (
        record.value == bytes32(0)
          ? oldValue == bytes32(0) ? 15000 : 30000
          : oldValue == bytes32(0) ? 0 : 15000 */
    
    if (!isEqual(this.state.root, record.stateRootLeave)) {
      this.fail({
        _type: 'SSTORE',
        ...this.getWitnessProof(),
        recordIndex: this.recordIndex,
        accountProof,
        storageProof
      });
    }
    let refund: number;
    if (isEqual(value, 0)) {
      if (isEqual(oldValue, 0)) refund = 15000;
      else refund = 30000;
    } else {
      if (isEqual(oldValue, 0)) refund = 0;
      else refund = 15000;
    }
    if (!isEqual(refund, record.refund)) {
      this.fail({
        _type: 'SSTORE',
        ...this.getWitnessProof(),
        recordIndex: this.recordIndex,
        accountProof,
        storageProof
      })
    }
  }

  async checkExtCodeSize() {
    const record = <ExtCodeSizeWitness> this.witness.state_access_list[this.recordIndex];
    const accountCode = await this.state.getAccountCode(record.address);
    const size = new BN(accountCode.byteLength);
    if (!size.eq(record.size)) {
      const accountProof = await this.state.getAccountProof(record.address);
      this.fail({
        _type: 'EXTCODESIZE',
        ...this.getWitnessProof(),
        recordIndex: this.recordIndex,
        accountProof
      })
    }
  }

  async checkExtCodeHash() {
    const record = <ExtCodeHashWitness> this.witness.state_access_list[this.recordIndex];
    const accountCode = await this.state.getAccountCode(record.address);
    const hash = new BN(keccak256(accountCode));
    if (!(hash.eq(record.hash))) {
      const accountProof = await this.state.getAccountProof(record.address);
      this.fail({
        _type: 'EXTCODEHASH',
        ...this.getWitnessProof(),
        recordIndex: this.recordIndex,
        accountProof
      })
    }
  }

  async checkExtCodeCopy() {
    const record = <ExtCodeCopyWitness> this.witness.state_access_list[this.recordIndex];
    const account = await this.state.getAccount(record.address);
    let didExist = !isEqual(account.codeHash, emptyCodeHash);
    if (didExist != record.exists) {
      const accountProof = await this.state.getAccountProof(record.address);
      this.fail({
        _type: 'EXTCODECOPY',
        ...this.getWitnessProof(),
        recordIndex: this.recordIndex,
        accountProof
      })
    }
  }

  async checkBalance() {
    const record = <BalanceWitness> this.witness.state_access_list[this.recordIndex];
    const account = await this.state.getAccount(record.address);
    if (!account.balance.equals(toBuffer(record.balance))) {
      const accountProof = await this.state.getAccountProof(record.address);
      this.fail({
        _type: 'BALANCE',
        ...this.getWitnessProof(),
        recordIndex: this.recordIndex,
        accountProof
      });
    }
  }

  async checkSelfBalance() {
    const record = <SelfBalanceWitness> this.witness.state_access_list[this.recordIndex];
    const account = await this.state.getAccount(this.witness.context);
    if (!account.balance.equals(toBuffer(record.selfBalance))) {
      const accountProof = await this.state.getAccountProof(this.witness.context);
      this.fail({
        _type: 'SELFBALANCE',
        ...this.getWitnessProof(),
        recordIndex: this.recordIndex,
        accountProof
      });
    }
  }

  async checkChainId() {
    const record = <ChainidWitness> this.witness.state_access_list[this.recordIndex];
    if (!toBuffer(record.chainId).equals(toBuffer(common.chainId()))) {
      this.fail({
        _type: 'CHAINID',
        ...this.getWitnessProof(),
        recordIndex: this.recordIndex
      });
    }
  }

  async checkCall() {
    const inputRoot = this.state.root;
    const record = this.witness.state_access_list[this.recordIndex] as CallWitness;
    const to = record.address;
    const callerProof = await this.state.getAccountProof(this.witness.context);
    
    const caller = await this.state.getAccount(this.witness.context);
    const balance = toBn(caller.balance);

    // If the caller had insufficient balance, the call should simply have failed
    if (balance.lt(record.value)) {
      if (record.success || !isEqual(record.stateRootLeave, inputRoot)) {
        this.fail({
          _type: 'CALL',
          ...this.getWitnessProof(),
          recordIndex: this.recordIndex,
          callerProof,
          receiverProof: '0x'
        })
      } else return;
    }

    this.state.checkpoint()
    caller.balance = toBuffer(balance.sub(record.value))
    await this.state.putAccount(this.witness.context, caller);

    if (isEqual(to, getChildRelayAddressFromCommon())) {
      // Use calculated witness
      if (this.recordIndex > this.calculatedWitness.state_access_list.length) {
        // Use the hypervisor error proof
      }
      
      const calculatedRecord = this.calculatedWitness
        .state_access_list[this.recordIndex] as CallWitness;

      if (
        !calculatedRecord.opcode.eqn(0xf1) ||
        calculatedRecord.calldataHash != record.calldataHash
      ) {
        // Use the hypervisor error proof
      }

      const relay = await ChildRelay.create(
        this.state,
        this.childRelayAddress,
        bufferToInt(this.block.header.number)
      );
      const exitProof = await relay.getUpdateProof();

      // Check if the call to the relay had a valid input
      let decodedTx: OutgoingTransaction;
      try {
        decodedTx = outgoingTransactionFromCallInputs(
          calculatedRecord.calldata,
          toBuffer(this.witness.context),
          record.value,
          record.gas
        );
      } catch (err) {
        if (record.success || !isEqual(record.stateRootLeave, inputRoot)) {
          this.fail({
            _type: 'EXIT_CALL_ENCODING',
            ...this.getWitnessProof(),
            recordIndex: this.recordIndex,
            calldata: toHex(calculatedRecord.calldata)
          });
        }
        await this.state.revert();
        return
      }
      await relay.insert(toBuffer(decodedTx.encode()));
      if (!record.success || !isEqual(record.stateRootLeave, inputRoot)) {
        this.fail({
          _type: 'EXIT_CALL',
          header: this.header,
          ...this.getWitnessProof(),
          callerProof,
          recordIndex: this.recordIndex,
          calldata: toHex(calculatedRecord.calldata),
          stateProofBytes: exitProof.accountProof,
          storageProofBytes: exitProof.storageProof,
          leafProofBytes: exitProof.transactionProof
        });
      }
      await this.state.commit();
    } else if (caller.isContract()) {
      // If the call is to a contract, the record should have
      // success = false and stateRoot = entry root
      if (record.success || !isEqual(record.stateRootLeave, inputRoot)) {
        const receiverProof = await this.state.getAccountProof(toBuffer(to));
        this.fail({
          _type: 'CALL',
          ...this.getWitnessProof(),
          recordIndex: this.recordIndex,
          callerProof,
          receiverProof
        })
      }
      await this.state.commit();
    } else {
      const receiver = await this.state.getAccount(to);
      const receiverProof = await this.state.getAccountProof(to);
      receiver.balance = toBuffer(
        toBn(receiver.balance).add(record.value)
      );
      await this.state.putAccount(to, receiver);
      if (!record.success || !isEqual(this.state.root, record.stateRootLeave)) {
        this.fail({
          _type: 'CALL',
          ...this.getWitnessProof(),
          recordIndex: this.recordIndex,
          callerProof,
          receiverProof
        });
      }
      await this.state.commit();
    }
  }

  async checkStaticCall() {
    const record = this.witness.state_access_list[this.recordIndex] as StaticCallWitness;
    const to = record.address;
    const precompile = getPrecompile(to.toString('hex'));
    const calculatedRecord = this.calculatedWitness.state_access_list[this.recordIndex] as StaticCallWitness;
    if (!precompile) {
      if (
        !calculatedRecord.opcode.eqn(0xfa) ||
        !isEqual(keccak256(calculatedRecord.calldata), record.calldataHash)
      ) {
        // Execute hypervisor error proof
      }
      this.fail({
        _type: 'STATICCALL',
        ...this.getWitnessProof(),
        recordIndex: this.recordIndex,
        calldata: toHex(calculatedRecord.calldata)
      });
    }
    const result = precompile({
      data: calculatedRecord.calldata,
      gasLimit: record.gas,
      _common: common
    });
    if (!isEqual(keccak256(result.returnValue), record.returndata)) {
      this.fail({
        _type: 'STATICCALL',
        ...this.getWitnessProof(),
        recordIndex: this.recordIndex,
        calldata: toHex(calculatedRecord.calldata)
      });
    }
  }
}

export default WitnessAuditor;