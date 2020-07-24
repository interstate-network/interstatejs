export interface CheckpointEntity {
  isCheckpoint: boolean
  checkpoint(): void;
  commit(): Promise<void>;
  revert(): Promise<void>;
}