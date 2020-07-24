"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils = __importStar(require("ethereumjs-util"));
var ethereumjs_util_1 = require("ethereumjs-util");
var block_1 = require("../src/block");
var tape = require("tape");
function isHexPrefixed(str) {
    return str.toLowerCase().startsWith('0x');
}
function normalize(data) {
    Object.keys(data).forEach(function (i) {
        if (i !== 'homestead' && typeof data[i] === 'string') {
            data[i] = isHexPrefixed(data[i]) ? new ethereumjs_util_1.BN(utils.toBuffer(data[i])) : new ethereumjs_util_1.BN(data[i]);
        }
    });
}
tape('[Header]: difficulty tests', function (t) {
    function runDifficultyTests(test, parentBlock, block, msg) {
        normalize(test);
        var dif = block.header.canonicalDifficulty(parentBlock);
        t.equal(dif.toString(), test.currentDifficulty.toString(), "test canonicalDifficulty (" + msg + ")");
        t.assert(block.header.validateDifficulty(parentBlock), "test validateDifficulty (" + msg + ")");
    }
    var hardforkTestData = {
        chainstart: require('./difficultyFrontier.json').tests,
        homestead: require('./difficultyHomestead.json').tests,
        byzantium: require('./difficultyByzantium.json').tests,
        constantinople: require('./difficultyConstantinople.json').tests,
        muirGlacier: Object.assign(require('./difficultyEIP2384.json').tests, require('./difficultyEIP2384_random.json').tests, require('./difficultyEIP2384_random_to20M.json').tests),
    };
    for (var hardfork in hardforkTestData) {
        var testData = hardforkTestData[hardfork];
        for (var testName in testData) {
            var test_1 = testData[testName];
            var parentBlock = new block_1.Block(undefined, { chain: 'mainnet', hardfork: hardfork });
            parentBlock.header.timestamp = test_1.parentTimestamp;
            parentBlock.header.difficulty = test_1.parentDifficulty;
            parentBlock.header.uncleHash = test_1.parentUncles;
            var block = new block_1.Block(undefined, { chain: 'mainnet', hardfork: hardfork });
            block.header.timestamp = test_1.currentTimestamp;
            block.header.difficulty = test_1.currentDifficulty;
            block.header.number = test_1.currentBlockNumber;
            runDifficultyTests(test_1, parentBlock, block, "fork determination by hardfork param (" + hardfork + ")");
        }
    }
    var chainTestData = {
        mainnet: require('./difficultyMainNetwork.json').tests,
        ropsten: require('./difficultyRopstenConstantinople.json').tests,
    };
    for (var chain in chainTestData) {
        var testData = chainTestData[chain];
        for (var testName in testData) {
            var test_2 = testData[testName];
            var parentBlock = new block_1.Block(undefined, { chain: chain });
            parentBlock.header.timestamp = test_2.parentTimestamp;
            parentBlock.header.difficulty = test_2.parentDifficulty;
            parentBlock.header.uncleHash = test_2.parentUncles;
            var block = new block_1.Block(undefined, { chain: chain });
            block.header.timestamp = test_2.currentTimestamp;
            block.header.difficulty = test_2.currentDifficulty;
            block.header.number = test_2.currentBlockNumber;
            runDifficultyTests(test_2, parentBlock, block, "fork determination by block number (" + test_2.currentBlockNumber + ")");
        }
    }
    t.end();
    // Temporarily run local test selection
    // also: implicit testing through ethereumjs-vm tests
    // (no Byzantium difficulty tests available yet)
    /*
    let args = {}
    args.file = /^difficultyHomestead/
    testing.getTestsFromArgs('BasicTests', (fileName, testName, test) => {
      return new Promise((resolve, reject) => {
        runDifficultyTests(test)
        resolve()
      }).catch(err => console.log(err))
    }, args).then(() => {
      t.end()
    })
    */
});
//# sourceMappingURL=difficulty.js.map