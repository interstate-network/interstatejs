"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var tape = require("tape");
var ethereumjs_common_1 = __importDefault(require("ethereumjs-common"));
var utils = __importStar(require("ethereumjs-util"));
var ethereumjs_util_1 = require("ethereumjs-util");
var header_1 = require("../src/header");
var block_1 = require("../src/block");
tape('[Block]: Header functions', function (t) {
    t.test('should create with default constructor', function (st) {
        function compareDefaultHeader(st, header) {
            st.deepEqual(header.parentHash, utils.zeros(32));
            st.equal(header.uncleHash.toString('hex'), utils.KECCAK256_RLP_ARRAY_S);
            st.deepEqual(header.coinbase, utils.zeros(20));
            st.deepEqual(header.stateRoot, utils.zeros(32));
            st.equal(header.transactionsTrie.toString('hex'), utils.KECCAK256_RLP_S);
            st.equal(header.receiptTrie.toString('hex'), utils.KECCAK256_RLP_S);
            st.deepEqual(header.bloom, utils.zeros(256));
            st.deepEqual(header.difficulty, Buffer.from([]));
            st.deepEqual(header.number, utils.toBuffer(1150000));
            st.deepEqual(header.gasLimit, Buffer.from('ffffffffffffff', 'hex'));
            st.deepEqual(header.gasUsed, Buffer.from([]));
            st.deepEqual(header.timestamp, Buffer.from([]));
            st.deepEqual(header.extraData, Buffer.from([]));
            st.deepEqual(header.mixHash, utils.zeros(32));
            st.deepEqual(header.nonce, utils.zeros(8));
        }
        var header = new header_1.BlockHeader();
        compareDefaultHeader(st, header);
        var block = new block_1.Block();
        header = block.header;
        compareDefaultHeader(st, header);
        st.end();
    });
    t.test('should test header initialization', function (st) {
        var header1 = new header_1.BlockHeader(undefined, { chain: 'ropsten' });
        var common = new ethereumjs_common_1.default('ropsten');
        var header2 = new header_1.BlockHeader(undefined, { common: common });
        header1.setGenesisParams();
        header2.setGenesisParams();
        st.strictEqual(header1.hash().toString('hex'), header2.hash().toString('hex'), 'header hashes match');
        st.throws(function () {
            new header_1.BlockHeader(undefined, { chain: 'ropsten', common: common });
        }, /not allowed!$/, 'should throw on initialization with chain and common parameter'); // eslint-disable-line
        st.end();
    });
    t.test('should test validateGasLimit', function (st) {
        var testData = require('./bcBlockGasLimitTest.json').tests;
        var bcBlockGasLimigTestData = testData.BlockGasLimit2p63m1;
        Object.keys(bcBlockGasLimigTestData).forEach(function (key) {
            var parentBlock = new block_1.Block(ethereumjs_util_1.rlp.decode(bcBlockGasLimigTestData[key].genesisRLP));
            var block = new block_1.Block(ethereumjs_util_1.rlp.decode(bcBlockGasLimigTestData[key].blocks[0].rlp));
            st.equal(block.header.validateGasLimit(parentBlock), true);
        });
        st.end();
    });
    t.test('should test isGenesis', function (st) {
        var header = new header_1.BlockHeader();
        st.equal(header.isGenesis(), false);
        header.number = Buffer.from([]);
        st.equal(header.isGenesis(), true);
        st.end();
    });
    var testDataGenesis = require('./genesishashestest.json').test;
    t.test('should test genesis hashes (mainnet default)', function (st) {
        var header = new header_1.BlockHeader();
        header.setGenesisParams();
        st.strictEqual(header.hash().toString('hex'), testDataGenesis.genesis_hash, 'genesis hash match');
        st.end();
    });
    t.test('should test genesis parameters (ropsten)', function (st) {
        var genesisHeader = new header_1.BlockHeader(undefined, { chain: 'ropsten' });
        genesisHeader.setGenesisParams();
        var ropstenStateRoot = '217b0bbcfb72e2d57e28f33cb361b9983513177755dc3f33ce3e7022ed62b77b';
        st.strictEqual(genesisHeader.stateRoot.toString('hex'), ropstenStateRoot, 'genesis stateRoot match');
        st.end();
    });
});
//# sourceMappingURL=header.js.map