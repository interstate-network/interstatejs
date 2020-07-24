import { BufferLike, CommitmentHeaderQuery, CommitmentHeaderInput, CommitmentHeaderData, CommitmentHeaderJson } from './types'
import { keccak256, toHex } from '@interstatejs/utils';
import { toBuffer, bufferToHex } from 'ethereumjs-util';
import { CommitmentHeaderABI, setEncodeABI } from './abi';

export class CommitmentHeader {
  public parentHash?: BufferLike;
  public childIndex?: BufferLike;
  public blockNumber?: BufferLike;
  public submittedAt!: Buffer;
  public exitsRoot!: Buffer;
  public coinbase!: Buffer;
  public blockHash!: Buffer;
  public isConfirmed!: boolean;

  encodeABI?: () => BufferLike;
  static decodeABI?: (input: BufferLike) => CommitmentHeader;

  constructor(options: CommitmentHeaderInput) {
    let {
      block,
      header,
      commitment,
      query: {
        commitment: qCommitment = null,
        ...query
      } = {},
      ...rest
    } = options;

    header = block?.header || header;
    let headerInfo: any = header ? {
      parentHash: header.parentHash,
      blockNumber: header.number,
      exitsRoot: header.exitsRoot,
      coinbase: header.coinbase,
      blockHash: header.hash()
    } : {}
    Object.assign(this, commitment || qCommitment || {}, query || {}, rest || {}, headerInfo);
    setEncodeABI<CommitmentHeader>(CommitmentHeaderABI, this);
  }

  hash(): Buffer {
    return keccak256(toBuffer(this.encodeABI!()));
  }

  encodeJSON(): CommitmentHeaderJson {
    return {
      parentHash: toHex(this.parentHash),
      childIndex: toHex(this.childIndex),
      blockNumber: toHex(this.blockNumber),
      submittedAt: toHex(this.submittedAt),
      exitsRoot: toHex(this.exitsRoot),
      coinbase: toHex(this.coinbase),
      blockHash: toHex(this.blockHash),
      isConfirmed: this.isConfirmed || false
    }
  }

  get commitment(): CommitmentHeaderData {
    const { submittedAt, exitsRoot, coinbase, blockHash } = this;
    return { submittedAt, exitsRoot, coinbase, blockHash };
  }

  set commitment(commitment: CommitmentHeaderData) {
    Object.assign(this, commitment)
  }

  get query(): CommitmentHeaderQuery {
    // const { parentHash, childIndex, blockNumber, commitment } = this;
    // if (parentHash == undefined) throw new Error(`Insufficient data for query: Missing parentHash.`)
    // if (childIndex == undefined) throw new Error(`Insufficient data for query: Missing childIndex.`)
    // if (blockNumber == undefined) throw new Error(`Insufficient data for query: Missing blockNumber.`);
    const { parentHash, childIndex, blockNumber, ...commitment } = this.encodeJSON();
    return {
      parentHash,
      childIndex,
      blockNumber,
      commitment
    }
    return { parentHash, childIndex, blockNumber, commitment };
  }

  set query(_query: CommitmentHeaderQuery) {
    const { commitment, ...query } = _query;
    Object.assign(this, commitment || {}, query);
  }
}