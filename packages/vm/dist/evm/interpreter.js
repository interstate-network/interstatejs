"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const exceptions_1 = require("../exceptions");
const memory_1 = __importDefault(require("./memory"));
const stack_1 = __importDefault(require("./stack"));
const opFns_1 = require("./opFns");
class Interpreter {
    constructor(vm, eei) {
        this._vm = vm;
        this._state = vm.stateManager;
        this._eei = eei;
        this._runState = {
            programCounter: 0,
            opCode: 0xfe,
            memory: new memory_1.default(),
            memoryWordCount: new BN(0),
            highestMemCost: new BN(0),
            stack: new stack_1.default(),
            code: Buffer.alloc(0),
            validJumps: [],
            _common: this._vm._common,
            stateManager: this._state,
            eei: this._eei,
        };
        if (vm.produceWitness) {
            this._runState.produceWitness = true;
            this._runState.state_access_list = [];
        }
    }
    async run(code, opts = {}) {
        this._runState.code = code;
        this._runState.programCounter = opts.pc || this._runState.programCounter;
        this._runState.validJumps = this._getValidJumpDests(code);
        const pc = this._runState.programCounter;
        if (pc !== 0 && (pc < 0 || pc >= this._runState.code.length)) {
            throw new Error('Internal error: program counter not in range');
        }
        let err;
        while (this._runState.programCounter < this._runState.code.length) {
            const opCode = this._runState.code[this._runState.programCounter];
            this._runState.opCode = opCode;
            await this._runStepHook();
            try {
                await this.runStep();
            }
            catch (e) {
                if (e.error !== exceptions_1.ERROR.STOP) {
                    err = e;
                }
                break;
            }
        }
        return {
            runState: this._runState,
            exceptionError: err,
        };
    }
    async runStep() {
        const opInfo = this.lookupOpInfo(this._runState.opCode);
        if (opInfo.name === 'INVALID') {
            throw new exceptions_1.VmError(exceptions_1.ERROR.INVALID_OPCODE);
        }
        this._eei.useGas(new BN(opInfo.fee));
        this._runState.programCounter++;
        const opFn = this.getOpHandler(opInfo);
        if (opInfo.isAsync) {
            await opFn.apply(null, [this._runState]);
        }
        else {
            opFn.apply(null, [this._runState]);
        }
    }
    getOpHandler(opInfo) {
        return opFns_1.handlers[opInfo.name];
    }
    lookupOpInfo(op, full = false) {
        const opcode = this._vm._opcodes[op]
            ? this._vm._opcodes[op]
            : { name: 'INVALID', fee: 0, isAsync: false };
        if (full) {
            let name = opcode.name;
            if (name === 'LOG') {
                name += op - 0xa0;
            }
            if (name === 'PUSH') {
                name += op - 0x5f;
            }
            if (name === 'DUP') {
                name += op - 0x7f;
            }
            if (name === 'SWAP') {
                name += op - 0x8f;
            }
            return Object.assign(Object.assign({}, opcode), { name });
        }
        return opcode;
    }
    async _runStepHook() {
        const eventObj = {
            pc: this._runState.programCounter,
            gasLeft: this._eei.getGasLeft(),
            opcode: this.lookupOpInfo(this._runState.opCode, true),
            stack: this._runState.stack._store,
            depth: this._eei._env.depth,
            address: this._eei._env.address,
            account: this._eei._env.contract,
            stateManager: this._runState.stateManager,
            memory: this._runState.memory._store,
            memoryWordCount: this._runState.memoryWordCount,
        };
        return this._vm._emit('step', eventObj);
    }
    _getValidJumpDests(code) {
        const jumps = [];
        for (let i = 0; i < code.length; i++) {
            const curOpCode = this.lookupOpInfo(code[i]).name;
            if (curOpCode === 'PUSH') {
                i += code[i] - 0x5f;
            }
            if (curOpCode === 'JUMPDEST') {
                jumps.push(i);
            }
        }
        return jumps;
    }
}
exports.default = Interpreter;
//# sourceMappingURL=interpreter.js.map