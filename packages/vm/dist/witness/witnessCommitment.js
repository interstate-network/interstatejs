"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WitnessCommitment = exports.commitmentsFromWitnesses = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const exceptions_1 = require("../exceptions");
const getCallRecords = (messageWitness) => messageWitness
    .state_access_list
    .filter((access) => (access.opcode.eqn(0xf1) ||
    access.opcode.eqn(0xf2) ||
    access.opcode.eqn(0xf4) ||
    access.opcode.eqn(0xfa)));
const nullIndexData = ethereumjs_util_1.keccak256(exceptions_1.ERROR.INSUFFICIENT_BALANCE);
function callDepthContained(witnessIndex, witnesses) {
    let nextWitness = witnesses[witnessIndex];
    let records = getCallRecords(nextWitness);
    let depth = 0;
    for (let record of records) {
        if (!record.success && record.returndata.equals(nullIndexData))
            continue;
        depth += 1;
        let nextIndex = witnessIndex + depth;
        depth += callDepthContained(nextIndex, witnesses);
    }
    return depth;
}
function commitmentsFromWitnesses(witnesses) {
    const commitments = [];
    let depth = 0;
    for (let i = 0; i < witnesses.length; i++) {
        let callDepthIndex = [];
        let witness = witnesses[i];
        let witnessHash = ethereumjs_util_1.keccak256(witness.encode());
        const { stateRootEnter, stateRootLeave, } = witness;
        let callRecords = getCallRecords(witness);
        for (let record of callRecords) {
            if (!record.success && record.returndata.equals(nullIndexData)) {
                callDepthIndex.push(0);
                continue;
            }
            depth += 1;
            let nextDepth = callDepthContained(i + depth, witnesses);
            callDepthIndex.push(nextDepth + 1);
            depth += nextDepth;
        }
        commitments.push({ stateRootEnter, stateRootLeave, callDepthIndex, witnessHash });
    }
    return commitments;
}
exports.commitmentsFromWitnesses = commitmentsFromWitnesses;
class WitnessCommitment {
    constructor(callDepthIndex, stateRootEnter, stateRootLeave, witnessHash) {
        this.callDepthIndex = callDepthIndex;
        this.stateRootEnter = stateRootEnter;
        this.stateRootLeave = stateRootLeave;
        this.witnessHash = witnessHash;
    }
}
exports.WitnessCommitment = WitnessCommitment;
//# sourceMappingURL=witnessCommitment.js.map