import './setup'
import MemDown from 'memdown'
import {
  createMockProvider,
  deployContract,
  getWallets,
} from 'ethereum-waffle'

import { BaseTree as SparseMerkleTreeImpl } from '../../src/base-tree';
import { hexStrToBuf, bufToHexString } from './helpers'
import { getDefaultHashes, keccak256 } from '../../src/utils'
import { BigNumber, ONE, ZERO } from '../../src/types'

import { makeRepeatedBytes } from './helpers'

import * as RollupMerkleUtils from '../../build/SparseMerkleTree.json'
import * as EstimatorTree from '../../build/EstimatorTree.json'

// import debug from 'debug'
// const log = debug('test:info:merkle-utils')

async function createSMTfromDataBlocks(
  dataBlocks: Buffer[]
): Promise<SparseMerkleTreeImpl> {
  let treeHeight = Math.ceil(Math.log2(dataBlocks.length)) + 1 // The height should actually not be plus 1
  // if (treeHeight == 1) treeHeight = 2;
  const tree = await getNewSMT(treeHeight)
  for (let i = 0; i < dataBlocks.length; i++) {
    await tree.update(new BigNumber(i, 10), dataBlocks[i])
  }
  return tree
}

async function getNewSMT(treeHeight: number): Promise<SparseMerkleTreeImpl> {
  return SparseMerkleTreeImpl.create(undefined, undefined, treeHeight)
}

function makeRandomBlockOfSize(blockSize: number): string[] {
  const block = []
  for (let i = 0; i < blockSize; i++) {
    block.push(makeRepeatedBytes('' + Math.floor(Math.random() * 500 + 1), 32))
  }
  return block
}

/* Begin tests */
describe('RollupMerkleUtils', () => {
  const provider = createMockProvider()
  const [wallet1] = getWallets(provider)
  let rollupMerkleUtils

  /* Deploy RollupMerkleUtils library before tests */
  before(async () => {
    rollupMerkleUtils = await deployContract(wallet1, RollupMerkleUtils, [], {
      gasLimit: 6700000,
    });
    // console.log(Object.keys(rollupMerkleUtils.functions.verify))
  })

  it('Gets the correct default hashes', async () => {
    const rootHashes = getDefaultHashes(256).reverse();
    const result = await rollupMerkleUtils.getDefaultHashes();
    for (let i = 0; i < 256; i++) {
      result[i].should.equal(bufToHexString(rootHashes[i]))
    }
  });

  describe('getMerkleRoot() ', async () => {
    it('should produce a correct merkle tree with two leaves', async () => {
      const block = ['0x1234', '0x4321']
      const bufBlock = block.map((data) => hexStrToBuf(data))
      // Create the Solidity tree, returning the root
      const result = await rollupMerkleUtils.getMerkleRoot(block)
      // Create a local tree
      const tree = await createSMTfromDataBlocks(bufBlock)
      // Get the root
      const root: Buffer = tree.rootHash
      // Compare!
      result.should.equal(bufToHexString(root))
    })

    it('should produce a correct sparse merkle tree with three leaves', async () => {
      const block = ['0x1234', '0x4321', '0x0420']
      const bufBlock = block.map((data) => hexStrToBuf(data))
      // Create the Solidity tree, returning the root
      const result = await rollupMerkleUtils.getMerkleRoot(block)
      // Create a local tree
      const tree = await createSMTfromDataBlocks(bufBlock)
      // Get the root
      const root: Buffer = tree.rootHash
      // Compare!
      result.should.equal(bufToHexString(root))
    })

    it('should produce correct merkle trees with leaves ranging from 1 to 10', async () => {
      for (let i = 1; i < 10; i++) {
        const block = []
        for (let j = 0; j < i; j++) {
          block.push(
            makeRepeatedBytes('' + Math.floor(Math.random() * 500 + 1), 32)
          )
        }
        const bufBlock = block.map((data) => hexStrToBuf(data))
        // Create the Solidity tree, returning the root
        const result = await rollupMerkleUtils.getMerkleRoot(block)
        // Create a local tree
        const tree = await createSMTfromDataBlocks(bufBlock)
        // Get the root
        const root: Buffer = tree.rootHash
        // Compare!
        result.should.equal(bufToHexString(root))
      }
    })
  })

  describe('verify()', async () => {
    it('should verify all the nodes of trees at various heights with full proofs', async () => {
      const maxBlockSize = 5
      const minBlockSize = 1
      // Create trees of multiple sizes tree
      for (
        let blockSize = minBlockSize;
        blockSize < maxBlockSize + 1;
        blockSize++
      ) {
        // Create the block we'll prove inclusion for
        const block = makeRandomBlockOfSize(blockSize)
        const bufBlock = block.map((data) => hexStrToBuf(data))
        const treeHeight = Math.ceil(Math.log2(bufBlock.length))
        // Create a local tree
        const tree = await createSMTfromDataBlocks(bufBlock)
        // Get the root
        const root: Buffer = tree.rootHash

        // Now that the root is set, let's try verifying all the nodes
        for (let j = 0; j < block.length; j++) {
          const indexOfNode = j
          // Generate an inclusion proof
          const inclusionProof = await tree.getMerkleProof(
            new BigNumber(indexOfNode),
            bufBlock[indexOfNode]
          )
          // Extract the values we need for the proof in the form we need them
          const path = bufToHexString(inclusionProof.key.toBuffer('B', 32))
          const siblings = inclusionProof.siblings.map((sibBuf) =>
            bufToHexString(sibBuf)
          )
          const isValid = await rollupMerkleUtils.verify(
            bufToHexString(inclusionProof.rootHash),
            bufToHexString(inclusionProof.value),
            path,
            siblings
          )
          // Make sure that the verification was successful
          isValid.should.equal(true)
        }
      }
    })

    it('should verify all the nodes of trees at various heights with partial proofs', async () => {
      const maxBlockSize = 5
      const minBlockSize = 2
      // Create trees of multiple sizes tree
      for (
        let blockSize = minBlockSize;
        blockSize < maxBlockSize + 1;
        blockSize++
      ) {
        // Create the block we'll prove inclusion for
        const block = makeRandomBlockOfSize(blockSize)
        const bufBlock = block.map((data) => hexStrToBuf(data))
        const treeHeight = Math.ceil(Math.log2(bufBlock.length)) + 1
        // Create a local tree
        const tree = await createSMTfromDataBlocks(bufBlock)

        
        // Now that the root is set, let's try verifying all the nodes
        for (let j = 0; j < block.length; j++) {
          const indexOfNode = j
          // Generate an inclusion proof
          const inclusionProof = await tree.getSparseMerkleProof(
            new BigNumber(indexOfNode),
            bufBlock[indexOfNode]
          )
          // Extract the values we need for the proof in the form we need them
          const path = bufToHexString(inclusionProof.key.toBuffer('B', 32))
          const siblings = inclusionProof.siblings.map((sibBuf) =>
            bufToHexString(sibBuf)
          )
          const isValid = await rollupMerkleUtils.verifySparse(
            bufToHexString(inclusionProof.rootHash),
            treeHeight,
            bufToHexString(inclusionProof.inclusionBits.toBuffer('B', 32)),
            bufToHexString(inclusionProof.value),
            path,
            siblings
          )
          if (!isValid) console.log(inclusionProof)
          // Make sure that the verification was successful
          isValid.should.equal(true)
        }
      }
    })
  })

  describe('verifyAndUpdate()', async () => {
    async function doVerifyAndUpdate(blockSize: number) {
      const block = makeRandomBlockOfSize(blockSize)
      const bufBlock = block.map((data) => hexStrToBuf(data))
      const treeHeight = Math.ceil(Math.log2(bufBlock.length)) + 1
      const tree = await createSMTfromDataBlocks(bufBlock)
      for (let j = 0; j < block.length; j++) {
        const indexOfNode = j
        // Generate an inclusion proof
        const inclusionProof = await tree.getMerkleProof(
          new BigNumber(indexOfNode),
          bufBlock[indexOfNode]
        )
        const root = bufToHexString(inclusionProof.rootHash)
        // Extract the values we need for the proof in the form we need them
        const path = bufToHexString(inclusionProof.key.toBuffer('B', 32))
        const siblings = inclusionProof.siblings.map((sibBuf) =>
          bufToHexString(sibBuf)
        )
        const newLeaf = keccak256(bufBlock[indexOfNode]);
        await tree.update(
          new BigNumber(indexOfNode),
          newLeaf
        )
        const result = await rollupMerkleUtils.verifyAndUpdate(
          root,
          bufToHexString(inclusionProof.value),
          bufToHexString(newLeaf),
          path,
          siblings
        )
        result._valid.should.equal(true)
        result._updatedRoot.should.equal(bufToHexString(tree.rootHash))
      }
    }

    async function doVerifyAndUpdateSparse(blockSize: number) {
      const block = makeRandomBlockOfSize(blockSize)
      const bufBlock = block.map((data) => hexStrToBuf(data))
      const treeHeight = Math.ceil(Math.log2(bufBlock.length)) + 1
      const tree = await createSMTfromDataBlocks(bufBlock)
      for (let j = 0; j < block.length; j++) {
        const indexOfNode = j
        // Generate an inclusion proof
        const inclusionProof = await tree.getSparseMerkleProof(
          new BigNumber(indexOfNode),
          bufBlock[indexOfNode]
        )
        const root = bufToHexString(inclusionProof.rootHash)
        // Extract the values we need for the proof in the form we need them
        const path = bufToHexString(inclusionProof.key.toBuffer('B', 32))
        const siblings = inclusionProof.siblings.map((sibBuf) =>
          bufToHexString(sibBuf)
        )
        const newLeaf = keccak256(bufBlock[indexOfNode]);
        await tree.update(
          new BigNumber(indexOfNode),
          newLeaf
        )
        const result = await rollupMerkleUtils.verifyAndUpdateSparse(
          root,
          treeHeight,
          bufToHexString(inclusionProof.inclusionBits.toBuffer('B', 32)),
          bufToHexString(inclusionProof.value),
          bufToHexString(newLeaf),
          path,
          siblings
        )
        result._valid.should.equal(true)
        result._updatedRoot.should.equal(bufToHexString(tree.rootHash))
      }
    }

    it('should verify and replace all the nodes of trees at various heights with full proofs', async () => {
      const maxBlockSize = 5
      const minBlockSize = 1
      // Create trees of multiple sizes tree
      for (
        let blockSize = minBlockSize;
        blockSize < maxBlockSize + 1;
        blockSize++
      ) {
        await doVerifyAndUpdate(blockSize)
      }
    })

    it('should verify and replace all the nodes of trees at various heights with partial proofs', async () => {
      const maxBlockSize = 5
      const minBlockSize = 1
      // Create trees of multiple sizes tree
      for (
        let blockSize = minBlockSize;
        blockSize < maxBlockSize + 1;
        blockSize++
      ) {
        await doVerifyAndUpdateSparse(blockSize)
      }
    })
  })

  describe('benchmark', async () => {
    let estimator;
    before(async () => {
      estimator = await deployContract(wallet1, EstimatorTree, [], {
        gasLimit: 6700000,
      });
    })

    async function benchmarkVerify(treeHeight: number) {
      const tree = new SparseMerkleTreeImpl(undefined, treeHeight);
      const block = makeRandomBlockOfSize(1)
      const bufBlock = block.map(s => hexStrToBuf(s));
      await tree.update(ZERO, bufBlock[0]);

      const sparseProof = await tree.getSparseMerkleProof(
        ZERO,
        bufBlock[0]
      )
      
      const sparseCost = await estimator.estimate.estimateVerifySparse(
        bufToHexString(sparseProof.rootHash),
        treeHeight,
        bufToHexString(sparseProof.inclusionBits.toBuffer('B', 32)),
        bufToHexString(sparseProof.value),
        bufToHexString(sparseProof.key.toBuffer('B', 32)),
        sparseProof.siblings.map((sibBuf) => bufToHexString(sibBuf))
      );

      
      const updateSparseCost = await estimator.estimate.estimateVerifyAndUpdateSparse(
        bufToHexString(sparseProof.rootHash),
        treeHeight,
        bufToHexString(sparseProof.inclusionBits.toBuffer('B', 32)),
        bufToHexString(sparseProof.value),
        bufToHexString(keccak256(bufBlock[0])),
        bufToHexString(sparseProof.key.toBuffer('B', 32)),
        sparseProof.siblings.map((sibBuf) => bufToHexString(sibBuf))
      )
      const inclusionProof = await tree.getMerkleProof(
        ZERO,
        bufBlock[0]
      );

      const fullCost = await estimator.estimate.estimateVerify(
        bufToHexString(inclusionProof.rootHash),
        bufToHexString(inclusionProof.value),
        bufToHexString(inclusionProof.key.toBuffer('B', 32)),
        inclusionProof.siblings.map((sibBuf) => bufToHexString(sibBuf))
      );

      const updateCost = await estimator.estimate.estimateVerifyAndUpdate(
        bufToHexString(inclusionProof.rootHash),
        bufToHexString(inclusionProof.value),
        bufToHexString(keccak256(bufBlock[0])),
        bufToHexString(inclusionProof.key.toBuffer('B', 32)),
        inclusionProof.siblings.map((sibBuf) => bufToHexString(sibBuf))
      );

      const getHashesCost = await estimator.estimate.estimateGetHashes(treeHeight);

      console.log(
        `Cost Benchmark: Height -- ${treeHeight}`
        + `\n\tVerify -- ${fullCost.toString(10)}`
        + `\n\tVerify Sparse -- ${sparseCost.toString(10)}`
        + `\n\tVerify & Update -- ${updateCost.toString(10)}`
        + `\n\tVerify & Update Sparse -- ${updateSparseCost.toString(10)}`
        + `\n\tGet Hashes -- ${getHashesCost.toString(10)}`
      );
    }

    it('Benchmark - height 16', async () => {
      await benchmarkVerify(16)
    })

    it('Benchmark - height 56', async () => {
      await benchmarkVerify(56)
    })

    it('Benchmark - height 160', async () => {
      await benchmarkVerify(160)
    })

    it('Benchmark - height 256', async () => {
      await benchmarkVerify(256)
    })
  })

  // describe('update()', async () => {
  //   it('should update all nodes correctly in trees of various heights', async () => {
  //     const minBlockSize = 1
  //     const maxBlockSize = 5
  //     for (
  //       let blockSize = minBlockSize;
  //       blockSize < maxBlockSize;
  //       blockSize++
  //     ) {
  //       const block = makeRandomBlockOfSize(blockSize)
  //       const bufBlock = block.map((data) => hexStrToBuf(data))
  //       const treeHeight = Math.ceil(Math.log2(bufBlock.length))
  //       // Create a local tree
  //       const tree = await createSMTfromDataBlocks(bufBlock)
  //       // Get the root
  //       const root: Buffer = tree.rootHash
  //       // Set the root and the height of our stored tree
  //       await rollupMerkleUtils.setMerkleRootAndHeight(root, treeHeight)

  //       // Now that we've set everything up, let's store the full tree in Solidity
  //       for (let leafIndex = 0; leafIndex < block.length; leafIndex++) {
  //         const inclusionProof = await tree.getMerkleProof(
  //           new BigNumber(leafIndex),
  //           bufBlock[leafIndex]
  //         )
  //         // Extract the values we need for the proof in the form we need them
  //         const path = bufToHexString(inclusionProof.key.toBuffer('B', 32))
  //         const siblings = inclusionProof.siblings.map((sibBuf) =>
  //           bufToHexString(sibBuf)
  //         )
  //         await rollupMerkleUtils.store(
  //           bufToHexString(inclusionProof.value),
  //           path,
  //           siblings
  //         )
  //       }

  //       // Exciting! We've stored the full tree. Let's start updating everything!
  //       const newBlock = makeRandomBlockOfSize(blockSize)
  //       const newBufBlock = newBlock.map((data) => hexStrToBuf(data))
  //       // For each leaf in the tree let's call update and compare the results
  //       for (let leafIndex = 0; leafIndex < block.length; leafIndex++) {
  //         await tree.update(new BigNumber(leafIndex), newBufBlock[leafIndex])
  //         const inclusionProof = await tree.getMerkleProof(
  //           new BigNumber(leafIndex),
  //           newBufBlock[leafIndex]
  //         )
  //         // Extract the values we need for the proof in the form we need them
  //         const path = bufToHexString(inclusionProof.key.toBuffer('B', 32))
  //         await rollupMerkleUtils.update(
  //           bufToHexString(inclusionProof.value),
  //           path
  //         )
  //         const newContractRoot = await rollupMerkleUtils.getRoot()
  //         const newLocalRoot: Buffer = tree.rootHash
  //         // Compare the updated roots! They should be equal.
  //         newContractRoot.should.equal(bufToHexString(newLocalRoot))
  //       }
  //     }
  //   }).timeout(5000)
  // })
})