"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildRelayAbi = exports.ChildRelay = void 0;
const contract_1 = require("web3x/contract");
const ChildRelayAbi_1 = __importDefault(require("./ChildRelayAbi"));
class ChildRelay extends contract_1.Contract {
    constructor(eth, address, options) {
        super(eth, ChildRelayAbi_1.default, address, options);
    }
    deploy() {
        return super.deployBytecode("0x608060405234801561001057600080fd5b50610c95806100206000396000f3fe6080604052600436106100345760003560e01c80630be8fffc1461003657806325bfbcf11461006c57806350a47c3e1461007f575b005b34801561004257600080fd5b506100566100513660046109ca565b610092565b6040516100639190610ac7565b60405180910390f35b61003461007a36600461096b565b6101e0565b61003461008d366004610914565b610287565b6000818152600160205260409020546060908067ffffffffffffffff811180156100bb57600080fd5b506040519080825280602002602001820160405280156100f557816020015b6100e2610722565b8152602001906001900390816100da5790505b50915060005b818110156101d957600084815260016020526040902080546101ba91908390811061012257fe5b600091825260209182902001805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152928301828280156101b05780601f10610185576101008083540402835291602001916101b0565b820191906000526020600020905b81548152906001019060200180831161019357829003601f168201915b5050505050610299565b8382815181106101c657fe5b60209081029190910101526001016100fb565b5050919050565b803410156102095760405162461bcd60e51b815260040161020090610b27565b60405180910390fd5b6108008251111561022c5760405162461bcd60e51b815260040161020090610b6b565b610234610722565b6040518060c00160405280336001600160a01b03168152602001866001600160a01b03168152602001858152602001833403815260200184815260200183815250905061028081610303565b5050505050565b61029483838360006101e0565b505050565b6102a1610722565b60008060008060606000878060200190518101906102bf9190610858565b6040805160c0810182526001600160a01b039788168152969095166020870152938501929092526060840152608083015260a082015296505050505050505b919050565b43600090815260016020526040902061031b826104c7565b815460018101835560009283526020928390208251610340949190920192019061076a565b504360009081526001602052604090205460608167ffffffffffffffff8111801561036a57600080fd5b5060405190808252806020026020018201604052801561039e57816020015b60608152602001906001900390816103895790505b50905060005b82811015610479574360009081526001602052604090208054829081106103c757fe5b600091825260209182902001805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152928301828280156104555780601f1061042a57610100808354040283529160200191610455565b820191906000526020600020905b81548152906001019060200180831161043857829003601f168201915b505050505082828151811061046657fe5b60209081029190910101526001016103a4565b50600061048582610512565b90508043557fa5609295255abf13ae172e1284503776c0f032078fd80052e2470804fd9f7ecb846040516104b99190610bb2565b60405180910390a150505050565b6060816000015182602001518360400151846060015185608001518660a001516040516020016104fc96959493929190610a7a565b6040516020818303038152906040529050919050565b6000815160001415610526575060006102fe565b8151600060606001830167ffffffffffffffff8111801561054657600080fd5b50604051908082528060200260200182016040528015610570578160200160208202803683370190505b50905060005b85518110156105b95785818151811061058b57fe5b6020026020010151805190602001208282815181106105a657fe5b6020908102919091010152600101610576565b508451600114156105e357806000815181106105d157fe5b602002602001015193505050506102fe565b6002830660011415610612576000801b8184815181106105ff57fe5b6020026020010181815250506001830192505b60018311156106d0576001919091019060005b600284048110156106885761066982826002028151811061064257fe5b602002602001015183836002026001018151811061065c57fe5b60200260200101516106ef565b82828151811061067557fe5b6020908102919091010152600101610625565b506002830492506002830660011480156106a3575082600114155b156106cb576000801b8184815181106106b857fe5b6020026020010181815250506001830192505b610612565b806000815181106106dd57fe5b60200260200101519350505050919050565b60008282604051602001610704929190610a6c565b60405160208183030381529060405280519060200120905092915050565b6040518060c0016040528060006001600160a01b0316815260200160006001600160a01b03168152602001600081526020016000815260200160608152602001600081525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106107ab57805160ff19168380011785556107d8565b828001600101855582156107d8579182015b828111156107d85782518255916020019190600101906107bd565b506107e49291506107e8565b5090565b61080291905b808211156107e457600081556001016107ee565b90565b600082601f830112610815578081fd5b813561082861082382610bf3565b610bcc565b915080825283602082850101111561083f57600080fd5b8060208401602084013760009082016020015292915050565b60008060008060008060c08789031215610870578182fd5b865161087b81610c47565b602088015190965061088c81610c47565b809550506040870151935060608701519250608087015167ffffffffffffffff8111156108b7578283fd5b80880189601f8201126108c8578384fd5b805191506108d861082383610bf3565b8281528a60208484010111156108ec578485fd5b6108fd836020830160208501610c17565b80945050505060a087015190509295509295509295565b600080600060608486031215610928578283fd5b833561093381610c47565b925060208401359150604084013567ffffffffffffffff811115610955578182fd5b61096186828701610805565b9150509250925092565b60008060008060808587031215610980578384fd5b843561098b81610c47565b935060208501359250604085013567ffffffffffffffff8111156109ad578283fd5b6109b987828801610805565b949793965093946060013593505050565b6000602082840312156109db578081fd5b5035919050565b600081518084526109fa816020860160208601610c17565b601f01601f19169290920160200192915050565b600060018060a01b03808351168452806020840151166020850152506040820151604084015260608201516060840152608082015160c06080850152610a5760c08501826109e2565b60a084015160a0860152809250505092915050565b918252602082015260400190565b6001600160a01b03878116825286166020820152604081018590526060810184905260c060808201819052600090610ab4908301856109e2565b90508260a0830152979650505050505050565b6000602080830181845280855180835260408601915060408482028701019250838701855b82811015610b1a57603f19888603018452610b08858351610a0e565b94509285019290850190600101610aec565b5092979650505050505050565b60208082526024908201527f496e73756666696369656e742076616c756520666f7220676976656e20626f75604082015263373a3c9760e11b606082015260800190565b60208082526027908201527f5472616e73616374696f6e206461746120746f6f206c617267653a206d61786960408201526636bab6901935b160c91b606082015260800190565b600060208252610bc56020830184610a0e565b9392505050565b60405181810167ffffffffffffffff81118282101715610beb57600080fd5b604052919050565b600067ffffffffffffffff821115610c09578081fd5b50601f01601f191660200190565b60005b83811015610c32578181015183820152602001610c1a565b83811115610c41576000848401525b50505050565b6001600160a01b0381168114610c5c57600080fd5b5056fea26469706673582212204ec5db2579eb45261053cdd30d9dfefecae113b516adc8da70e7f97ce29c546b64736f6c634300060b0033");
    }
}
exports.ChildRelay = ChildRelay;
exports.ChildRelayAbi = ChildRelayAbi_1.default;