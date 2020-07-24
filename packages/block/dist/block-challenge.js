"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockChallenge = exports.ChallengeStep = void 0;
const utils_1 = require("@interstatejs/utils");
var ChallengeStep;
(function (ChallengeStep) {
    ChallengeStep[ChallengeStep["NONE"] = 0] = "NONE";
    ChallengeStep[ChallengeStep["PENDING"] = 1] = "PENDING";
    ChallengeStep[ChallengeStep["RECEIVED"] = 2] = "RECEIVED"; // Witness has been received.
})(ChallengeStep = exports.ChallengeStep || (exports.ChallengeStep = {}));
function challengeToJSON(challenge) {
    return {
        lastUpdate: challenge.lastUpdate,
        challenger: utils_1.toHex(challenge.challenger),
        step: +challenge.step,
        witness: challenge.witness ? utils_1.toHex(challenge.witness) : undefined
    };
}
class BlockChallenge {
    constructor(data) {
        this.openChallenges = 0;
        this.challengedTransactions = [];
        this.challengesByTransaction = {};
        if (typeof data == 'string') {
            this.blockHash = data;
        }
        else if (typeof data == 'object') {
            Object.assign(this, data);
        }
    }
    putTransactionChallenge(data) {
        const { transactionIndex, blockNumber, challenger } = data;
        this.openChallenges++;
        this.challengedTransactions.push(transactionIndex);
        this.challengesByTransaction[transactionIndex] = {
            step: ChallengeStep.PENDING,
            lastUpdate: blockNumber,
            challenger
        };
    }
    putChallengeResponse(data) {
        const { transactionIndex, witness, blockNumber } = data;
        const challenge = this.challengesByTransaction[transactionIndex];
        challenge.lastUpdate = blockNumber;
        challenge.step = ChallengeStep.RECEIVED;
        challenge.witness = witness;
    }
    toJSON() {
        const challengeKeys = Object.keys(this.challengesByTransaction);
        return {
            blockHash: utils_1.toHex(this.blockHash),
            openChallenges: this.openChallenges,
            challengedTransactions: this.challengedTransactions,
            challengesByTransaction: challengeKeys.reduce((obj, k) => (Object.assign(Object.assign({}, obj), { [k]: challengeToJSON(this.challengesByTransaction[k]) })), {})
        };
    }
}
exports.BlockChallenge = BlockChallenge;
