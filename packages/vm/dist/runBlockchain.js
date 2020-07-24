"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async = require('async');
function runBlockchain(blockchain) {
    return new Promise((resolve, reject) => {
        const self = this;
        let headBlock;
        let parentState;
        blockchain = blockchain || this.blockchain;
        blockchain.iterator('vm', processBlock, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
        async function processBlock(block, reorg) {
            await getStartingState();
            await runBlock();
            function getStartingState() {
                return new Promise((resolve, reject) => {
                    if (!headBlock || reorg) {
                        blockchain.getBlock(block.header.parentHash, async function (err, parentBlock) {
                            if (err)
                                return reject(err);
                            parentState = parentBlock.header.stateRoot;
                            if (!headBlock) {
                                await self.stateManager.generateCanonicalGenesis();
                                return resolve();
                            }
                        });
                    }
                    else {
                        parentState = headBlock.header.stateRoot;
                        return resolve();
                    }
                });
            }
            async function runBlock() {
                return new Promise((resolve, reject) => {
                    self
                        .runBlock({
                        block: block,
                        root: parentState,
                    })
                        .then(() => {
                        headBlock = block;
                        resolve();
                    })
                        .catch(err => {
                        blockchain.delBlock(block.header.hash(), function () {
                            reject(err);
                        });
                    });
                });
            }
        }
    });
}
exports.default = runBlockchain;
//# sourceMappingURL=runBlockchain.js.map