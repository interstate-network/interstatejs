const BN = require('bn.js')
const { toBuffer } = require('ethereumjs-util')
// const {encodeAccess} = require('../dist/witness/message')
const { randomHexBuffer, toHex } = require('@interstatejs/utils');
const { expect } = require('chai');
const {
  SelfBalanceWitness,
  BalanceWitness,
  SloadWitness,
  SstoreWitness,
  BlockHashWitness,
  CoinbaseWitness,
  ExtCodeHashWitness,
  ExtCodeSizeWitness,
  ExtCodeCopyWitness,
  TimestampWitness,
  NumberWitness,
  ChainidWitness,
  CallWitness,
  DelegateCallWitness,
  StaticCallWitness,
  MessageWitness,
  decodeMessageWitness,
  Log0Witness,
  Log1Witness,
  Log2Witness,
  Log3Witness,
  Log4Witness,

} = require('../dist/witness');

const randAddress = new BN(randomHexBuffer(20));
const rand32 = new BN(randomHexBuffer(32));
const randUint = new BN(randomHexBuffer(1));
const randBuffer = randomHexBuffer(10);

describe('Message Witness Encoding', () => {
  it('Encodes and decodes', () => {
    const witness = new MessageWitness(
      rand32,
      rand32,
      true,
      randAddress,
      randAddress,
      randAddress,
      randAddress,
      randUint,
      randUint,
      randUint,
      randUint,
      randUint,
      rand32,
      randBuffer
    );
    witness.status = 0;
    const encoded = witness.encode();
    const decoded = decodeMessageWitness(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  })
});

describe('Access Record Encoding', () => {
  it('SelfBalanceWitness', () => {
    const record = new SelfBalanceWitness(randUint);
    const encoded = record.encode();
    const decoded = SelfBalanceWitness.decode(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  });

  it('BalanceWitness', () => {
    const record = new BalanceWitness(randAddress, randUint);
    const encoded = record.encode();
    const decoded = BalanceWitness.decode(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  });

  it('SloadWitness', () => {
    const record = new SloadWitness(rand32, randUint);
    const encoded = record.encode();
    const decoded = SloadWitness.decode(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  });

  it('SstoreWitness', () => {
    const record = new SstoreWitness(rand32, rand32, randUint, randUint);
    const encoded = record.encode();
    const decoded = SstoreWitness.decode(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  });

  it('CoinbaseWitness', () => {
    const record = new CoinbaseWitness(randAddress);
    const encoded = record.encode();
    const decoded = CoinbaseWitness.decode(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  });

  it('ExtCodeHashWitness', () => {
    const record = new ExtCodeHashWitness(randAddress, rand32);
    const encoded = record.encode();
    const decoded = ExtCodeHashWitness.decode(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  });

  it('ExtCodeSizeWitness', () => {
    const record = new ExtCodeSizeWitness(randAddress, randUint);
    const encoded = record.encode();
    const decoded = ExtCodeSizeWitness.decode(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  });

  it('ExtCodeCopyWitness', () => {
    const record = new ExtCodeCopyWitness(randAddress, true);
    const encoded = record.encode();
    const decoded = ExtCodeCopyWitness.decode(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  });

  it('TimestampWitness', () => {
    const record = new TimestampWitness(randUint);
    const encoded = record.encode();
    const decoded = TimestampWitness.decode(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  });

  it('NumberWitness', () => {
    const record = new NumberWitness(randUint)
    const encoded = record.encode();
    const decoded = NumberWitness.decode(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  });

  it('ChainidWitness', () => {
    const record = new ChainidWitness(randUint)
    const encoded = record.encode();
    const decoded = ChainidWitness.decode(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  });

  it('CallWitness', () => {
    const record = new CallWitness(
      rand32,
      randUint,
      randUint,
      randUint,
      randAddress,
      randUint,
      rand32,
      true,
      randBuffer
    );
    const encoded = record.encode();
    const decoded = CallWitness.decode(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  });

  it('DelegateCallWitness', () => {
    const record = new DelegateCallWitness(
      rand32,
      randUint,
      randUint,
      randUint,
      randAddress,
      rand32,
      true,
      randBuffer
    );
    const encoded = record.encode();
    const decoded = DelegateCallWitness.decode(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  });


  it('StaticCallWitness', () => {
    const record = new StaticCallWitness(
      randUint,
      randUint,
      randAddress,
      rand32,
      true,
      randBuffer
    );
    const encoded = record.encode();
    const decoded = StaticCallWitness.decode(encoded);
    const encoded2 = decoded.encode();
    expect(encoded).to.eq(encoded2)
  });
});