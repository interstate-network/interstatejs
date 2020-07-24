// import SimpleLevel from '../lib/simple-level';
// import { BlockSubmissionEvent } from '../parent-listeners/peg-listener';

// class BlockSubmission implements BlockSubmissionEvent {
//   public calldata: string;
//   public submittedAt: number;
//   public childIndex: number;
//   public blockHash: string;

//   constructor(data: BlockSubmissionEvent) {
//     Object.assign(this, data);
//   }

//   toJSON(): BlockSubmissionEvent {
//     const { calldata, submittedAt, childIndex, blockHash } = this;
//     return { calldata, submittedAt, childIndex, blockHash };
//   }
// }

// class BlockSubmissionDatabase extends SimpleLevel {
//   constructor(dbPath?: string) {
//     super('submitted-blocks', dbPath);
//   }

//   async get(key: string): Promise<BlockSubmission> {
//     const json = await super.get(key);
//     if (json == null) return null;
//     return new BlockSubmission(<BlockSubmissionEvent> json);
//   }
// }