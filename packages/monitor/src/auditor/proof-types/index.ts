export * from './access-list';
export * from './base-types';
export * from './witness-meta';
export * from './block';
import { TransactionErrorProof } from './transaction';
import { AccessListErrorProof } from './access-list';
import { WitnessMetaError } from './witness-meta';
import { BlockErrorProof } from './block';

export type ErrorProof = AccessListErrorProof |
  TransactionErrorProof |
  WitnessMetaError |
  BlockErrorProof;