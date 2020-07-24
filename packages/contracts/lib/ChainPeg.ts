import BN from "bn.js";
import { Address } from "web3x/address";
import { EventLog, TransactionReceipt } from "web3x/formatters";
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from "web3x/contract";
import { Eth } from "web3x/eth";
import abi from "./ChainPegAbi";
export type BlockChallengeEvent = {
    blockHash: string;
    transactionIndex: string;
    challenger: Address;
};
export type BlockConfirmedEvent = {
    blockHeight: string;
    blockHash: string;
};
export type BlockRevertedEvent = {
    blockHash: string;
    reason: string;
};
export type BlockSubmittedEvent = {
    blockHeight: string;
    parentHash: string;
    childIndex: string;
    blockHash: string;
};
export type ChallengeResponseEvent = {
    blockHash: string;
    transactionIndex: string;
    witness: string;
};
export type ErrorTestEvent = {
    transaction: {
        from: Address;
        to: Address;
        gas: string;
        value: string;
        data: string;
        stateRoot: string;
    };
    siblings: string[];
};
export type TestAddressEvent = {
    stateRoot: string;
    txSender: Address;
    upfrontCost: string;
};
export interface BlockChallengeEventLog extends EventLog<BlockChallengeEvent, "BlockChallenge"> {
}
export interface BlockConfirmedEventLog extends EventLog<BlockConfirmedEvent, "BlockConfirmed"> {
}
export interface BlockRevertedEventLog extends EventLog<BlockRevertedEvent, "BlockReverted"> {
}
export interface BlockSubmittedEventLog extends EventLog<BlockSubmittedEvent, "BlockSubmitted"> {
}
export interface ChallengeResponseEventLog extends EventLog<ChallengeResponseEvent, "ChallengeResponse"> {
}
export interface ErrorTestEventLog extends EventLog<ErrorTestEvent, "ErrorTest"> {
}
export interface TestAddressEventLog extends EventLog<TestAddressEvent, "TestAddress"> {
}
interface ChainPegEvents {
    BlockChallenge: EventSubscriptionFactory<BlockChallengeEventLog>;
    BlockConfirmed: EventSubscriptionFactory<BlockConfirmedEventLog>;
    BlockReverted: EventSubscriptionFactory<BlockRevertedEventLog>;
    BlockSubmitted: EventSubscriptionFactory<BlockSubmittedEventLog>;
    ChallengeResponse: EventSubscriptionFactory<ChallengeResponseEventLog>;
    ErrorTest: EventSubscriptionFactory<ErrorTestEventLog>;
    TestAddress: EventSubscriptionFactory<TestAddressEventLog>;
}
interface ChainPegEventLogs {
    BlockChallenge: BlockChallengeEventLog;
    BlockConfirmed: BlockConfirmedEventLog;
    BlockReverted: BlockRevertedEventLog;
    BlockSubmitted: BlockSubmittedEventLog;
    ChallengeResponse: ChallengeResponseEventLog;
    ErrorTest: ErrorTestEventLog;
    TestAddress: TestAddressEventLog;
}
interface ChainPegTxEventLogs {
    BlockChallenge: BlockChallengeEventLog[];
    BlockConfirmed: BlockConfirmedEventLog[];
    BlockReverted: BlockRevertedEventLog[];
    BlockSubmitted: BlockSubmittedEventLog[];
    ChallengeResponse: ChallengeResponseEventLog[];
    ErrorTest: ErrorTestEventLog[];
    TestAddress: TestAddressEventLog[];
}
export interface ChainPegTransactionReceipt extends TransactionReceipt<ChainPegTxEventLogs> {
}
interface ChainPegMethods {
    getConfirmedBlockhash(blockNumber: number | string | BN): TxCall<string>;
    getPendingChild(parentHash: string, childIndex: number | string | BN): TxCall<string>;
    getPendingChildren(parentHash: string): TxCall<string[]>;
    hasPendingBlock(_query: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }): TxCall<boolean>;
    hasPendingChallenge(_blockHash: string): TxCall<boolean>;
    isBlockConfirmed(blockNumber: number | string | BN): TxCall<boolean>;
    owner(): TxCall<Address>;
    initialize(sparse: Address, challengeManager: Address, relay: Address, archiveFactory: Address, byteCounter: Address, accessErrorProver: Address, blockErrorProver: Address, executionErrorProver: Address, transactionErrorProver: Address, encodingErrorProver: Address, witnessErrorProver: Address, hypervisorAddress: Address): TxSend<ChainPegTransactionReceipt>;
    submitBlock(_block: {
        header: {
            parentHash: string;
            number: number | string | BN;
            incomingTransactionsIndex: number | string | BN;
            incomingTransactionsCount: number | string | BN;
            transactionsCount: number | string | BN;
            transactionsRoot: string;
            stateRoot: string;
            exitsRoot: string;
            coinbase: Address;
            timestamp: number | string | BN;
        };
        transactions: string[];
    }): TxSend<ChainPegTransactionReceipt>;
    confirmBlock(_query: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }): TxSend<ChainPegTransactionReceipt>;
    challengeStep(data: string): TxSend<ChainPegTransactionReceipt>;
    proveAccessError(data: string): TxSend<ChainPegTransactionReceipt>;
    proveBlockError(data: string): TxSend<ChainPegTransactionReceipt>;
    proveExecutionError(data: string): TxSend<ChainPegTransactionReceipt>;
    proveTransactionError(data: string): TxSend<ChainPegTransactionReceipt>;
    proveWitnessError(data: string): TxSend<ChainPegTransactionReceipt>;
    proveEncodingError(data: string): TxSend<ChainPegTransactionReceipt>;
}
export interface ChainPegDefinition {
    methods: ChainPegMethods;
    events: ChainPegEvents;
    eventLogs: ChainPegEventLogs;
}
export class ChainPeg extends Contract<ChainPegDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions) {
        super(eth, abi, address, options);
    }
    deploy(): TxSend<ChainPegTransactionReceipt> {
        return super.deployBytecode("0x60806040523480156200001157600080fd5b506200001c620000f4565b50604080516101408101825260008082526020808301829052928201819052606082018190526080820181905260a082018190527f4b529be809997a3bb9e6aac629611bfe00c51044f4cb112a8b9b4ac7eab5c19a60c083015260e08201819052610100820181905261012082015290600c90620000a5908390620007a2620000c2821b17901c565b8154600181018355600092835260209092209091015550620001ce565b600081604051602001620000d7919062000155565b604051602081830303815290604052805190602001209050919050565b6040805161014081018252600080825260208201819052918101829052606081018290526080810182905260a0810182905260c0810182905260e08101829052610100810182905261012081019190915290565b6001600160a01b03169052565b600061014082019050825182526020830151602083015260408301516040830152606083015160608301526080830151608083015260a083015160a083015260c083015160c083015260e083015160e083015261010080840151620001bd8285018262000148565b505061012092830151919092015290565b6116a680620001de6000396000f3fe6080604052600436106100fe5760003560e01c80638947ea9a11610095578063991f6aad11610064578063991f6aad146102aa578063c71b9c95146102ca578063d492a2ef146102ea578063eadca6ff146102fd578063ecadb6861461031d576100fe565b80638947ea9a1461021b5780638da5cb5b1461023b57806393c5183b1461025d5780639705f9c11461028a576100fe565b806324dce362116100d157806324dce3621461019b57806335fa1a6f146101c8578063522df836146101e857806385754d45146101fb576100fe565b80630721307e146101035780630b800f48146101255780630ff7b9671461014557806315f9ce811461017b575b600080fd5b34801561010f57600080fd5b5061012361011e366004610f01565b61033d565b005b34801561013157600080fd5b50610123610140366004610f3c565b610373565b34801561015157600080fd5b50610165610160366004610eb0565b6103e1565b60405161017291906112b7565b60405180910390f35b34801561018757600080fd5b50610123610196366004611029565b610404565b3480156101a757600080fd5b506101bb6101b6366004610eb0565b61046e565b60405161017291906111d1565b3480156101d457600080fd5b506101236101e3366004610f01565b6104d6565b6101236101f6366004610f01565b610508565b34801561020757600080fd5b50610123610216366004610f01565b61053b565b34801561022757600080fd5b50610123610236366004610f01565b61056d565b34801561024757600080fd5b5061025061059f565b60405161017291906111bd565b34801561026957600080fd5b5061027d610278366004610eb0565b6105ae565b60405161017291906112ac565b34801561029657600080fd5b5061027d6102a5366004610eb0565b6105d5565b3480156102b657600080fd5b506101236102c5366004610f01565b6105ed565b3480156102d657600080fd5b506101236102e5366004610f01565b61061f565b6101236102f83660046110b7565b610651565b34801561030957600080fd5b50610165610318366004610ee0565b610763565b34801561032957600080fd5b5061027d610338366004611029565b610790565b60095460405182516001600160a01b0390921691600090819060208601855af43d6000833e806001811461036f573d83fd5b3d83f35b6001546001600160a01b0316156103a55760405162461bcd60e51b815260040161039c9061154d565b60405180910390fd5b6103c160008d8d8d8d8d8d8d8d8d8d8d8d63ffffffff6107d216565b5050601080546001600160a01b0319163317905550505050505050505050565b600080600c0182815481106103f257fe5b90600052602060002001549050919050565b61041560008263ffffffff6108db16565b5061042760008263ffffffff610a5c16565b80604001517ff71bcb63e907b0a47ea99c03a98948a4e160451097b2e245d8bc847f1211b5c082606001516060015160405161046391906112b7565b60405180910390a250565b6000818152600d602090815260409182902080548351818402810184019094528084526060938493909291908301828280156104c957602002820191906000526020600020905b8154815260200190600101908083116104b5575b5093979650505050505050565b60085460405182516001600160a01b0390921691600090819060208601855af43d6000833e806001811461036f573d83fd5b60015460405182516001600160a01b0390921691600090819060208601855af43d6000833e80610536573d82fd5b503d81f35b60075460405182516001600160a01b0390921691600090819060208601855af43d6000833e806001811461036f573d83fd5b600a5460405182516001600160a01b0390921691600090819060208601855af43d6000833e806001811461036f573d83fd5b6010546001600160a01b031681565b600c80546000918291849081106105c157fe5b906000526020600020015414159050919050565b60006105e7818363ffffffff610b3c16565b92915050565b60065460405182516001600160a01b0390921691600090819060208601855af43d6000833e806001811461036f573d83fd5b60055460405182516001600160a01b0390921691600090819060208601855af43d6000833e806001811461036f573d83fd5b3332146106705760405162461bcd60e51b815260040161039c906113b3565b6010546001600160a01b0316331461069a5760405162461bcd60e51b815260040161039c906112d6565b6106a2610b56565b6106ab81610b68565b6106c75760405162461bcd60e51b815260040161039c906113fe565b6106cf610d9e565b81516106da90610b8f565b8251516000908152600d602052604080822054855151835291209192509061070183610bd7565b815460018101835560009283526020928390200155835190810151905160608401516040517fda1ac488aa035adc71ce15baaa2f4cfc02dddb2face87e5150b12a9c2286a139926107569290918691906112c0565b60405180910390a2505050565b6000828152600d6020526040812080548390811061077d57fe5b9060005260206000200154905092915050565b60006105e7818363ffffffff610bea16565b6000816040516020016107b591906115af565b604051602081830303815290604052805190602001209050919050565b60028d01546001600160a01b0316156107fd5760405162461bcd60e51b815260040161039c906114b4565b60028d0180546001600160a01b03199081166001600160a01b039e8f16179091558d548116998d16999099178d5560018d0180548a169b8d169b909b17909a5560038c0180548916998c169990991790985560048b0180548816968b169690961790955560058a0180548716948a1694909417909355600689018054861692891692909217909155600788018054851691881691909117905560088701805484169187169190911790556009860180548316918616919091179055600a85018054821692851692909217909155600b90930180549093169116179055565b80516000908152600d83016020526040812060608301516108fb90610bd7565b8184602001518154811061090b57fe5b9060005260206000200154146109335760405162461bcd60e51b815260040161039c90611435565b61094584846060015160600151610b3c565b156109625760405162461bcd60e51b815260040161039c90611516565b826000015184600c0160018560400151038154811061097d57fe5b9060005260206000200154146109a55760405162461bcd60e51b815260040161039c9061146c565b6040830151600c850154146109cc5760405162461bcd60e51b815260040161039c90611370565b602083015115610a275760005b8360200151811015610a25576000801b8282815481106109f557fe5b906000526020600020015414610a1d5760405162461bcd60e51b815260040161039c906114e1565b6001016109d9565b505b606083015151610a3690610c30565b610a525760405162461bcd60e51b815260040161039c9061133b565b5060019392505050565b80516000908152600d83016020908152604082209083015181548110610a7e57fe5b906000526020600020018190555080606001516060015182600c01826040015181548110610aa857fe5b9060005260206000200181905550610ac7816060015160400151610c46565b6003820154604080830151606084015160200151915163070598e360e41b81526001600160a01b03909316926370598e3092610b069291600401611626565b600060405180830381600087803b158015610b2057600080fd5b505af1158015610b34573d6000803e3d6000fd5b505050505050565b6000908152600e9091016020526040902060010154151590565b610b66610b61610c87565b610c92565b565b6000610b7382610cec565b80156105e75750505161010001516001600160a01b0316331490565b610b97610d9e565b60405180608001604052804381526020018360e0015181526020018361010001516001600160a01b03168152602001610bcf846107a2565b905292915050565b6000816040516020016107b5919061157b565b6000610bf98260600151610bd7565b82516000908152600d8501602090815260409091209084015181548110610c1c57fe5b906000526020600020015414905092915050565b6000610c3a610d99565b82430310159050919050565b806001600160a01b03166108fc610c5b610c87565b6040518115909202916000818181858888f19350505050158015610c83573d6000803e3d6000fd5b5050565b662386f26fc1000090565b80341015610cb25760405162461bcd60e51b815260040161039c90611304565b80341115610ce95760405133903483900380156108fc02916000818181858888f19350505050158015610c83573d6000803e3d6000fd5b50565b805160a0015160208201516040516340ff34ef60e01b81526000929173__MerkleTreeLib_________________________916340ff34ef91610d3091600401611215565b60206040518083038186803b158015610d4857600080fd5b505af4158015610d5c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d809190610ec8565b1480156105e75750506020810151519051608001511490565b600190565b60408051608081018252600080825260208201819052918101829052606081019190915290565b80356105e78161165b565b600082601f830112610de0578081fd5b813567ffffffffffffffff811115610df6578182fd5b6020610e058182840201611634565b828152925080830184820160005b84811015610e3c57610e2a888584358a0101610e47565b83529183019190830190600101610e13565b505050505092915050565b600082601f830112610e57578081fd5b813567ffffffffffffffff811115610e6d578182fd5b610e80601f8201601f1916602001611634565b9150808252836020828501011115610e9757600080fd5b8060208401602084013760009082016020015292915050565b600060208284031215610ec1578081fd5b5035919050565b600060208284031215610ed9578081fd5b5051919050565b60008060408385031215610ef2578081fd5b50508035926020909101359150565b600060208284031215610f12578081fd5b813567ffffffffffffffff811115610f28578182fd5b610f3484828501610e47565b949350505050565b6000806000806000806000806000806000806101808d8f031215610f5e578788fd5b8c35610f698161165b565b9b5060208d0135610f798161165b565b9a5060408d0135610f898161165b565b995060608d0135610f998161165b565b985060808d0135610fa98161165b565b975060a08d0135610fb98161165b565b9650610fc88e60c08f01610dc5565b9550610fd78e60e08f01610dc5565b9450610fe78e6101008f01610dc5565b9350610ff78e6101208f01610dc5565b92506110078e6101408f01610dc5565b91506110178e6101608f01610dc5565b90509295989b509295989b509295989b565b600081830360e081121561103b578182fd5b6110456080611634565b8335815260208401356020820152604084013560408201526080605f198301121561106e578283fd5b6110786080611634565b9150606084013582526080840135602083015260a08401356110998161165b565b604083015260c0939093013560608083019190915283015250919050565b6000602082840312156110c8578081fd5b813567ffffffffffffffff808211156110df578283fd5b81840180860392506101608312156110f5578384fd5b6110ff6040611634565b6101408085121561110e578586fd5b61111781611634565b9450823585526020830135602086015260408301356040860152606083013560608601526080830135608086015260a083013560a086015260c083013560c086015260e083013560e086015261010061117289828601610dc5565b908601526101208381013590860152938152928101359282841115611195578485fd5b6111a187858401610dd0565b60208201529695505050505050565b6001600160a01b03169052565b6001600160a01b0391909116815260200190565b6020808252825182820181905260009190848201906040850190845b81811015611209578351835292840192918401916001016111ed565b50909695505050505050565b6000602080830181845280855180835260408601915060408482028701019250838701855b8281101561129f57878503603f1901845281518051808752885b8181101561126f578281018901518882018a01528801611254565b8181111561127f578989838a0101525b50601f01601f19169590950186019450928501929085019060010161123a565b5092979650505050505050565b901515815260200190565b90815260200190565b9283526020830191909152604082015260600190565b60208082526014908201527321b0b63632b9103737ba1030b8383937bb32b21760611b604082015260600190565b6020808252601c908201527f496e73756666696369656e742076616c75652072656365697665642e00000000604082015260600190565b6020808252818101527f426c6f636b206e6f7420726561647920746f20626520636f6e6669726d65642e604082015260600190565b60208082526023908201527f426c6f636b20616c726561647920636f6e6669726d656420666f722068656967604082015262343a1760e91b606082015260800190565b6020808252602b908201527f43616c6c6572206d75737420626520616e2065787465726e616c6c79206f776e60408201526a32b21030b1b1b7bab73a1760a91b606082015260800190565b6020808252601d908201527f426c6f636b206661696c656420696e7465677269747920636865636b2e000000604082015260600190565b60208082526018908201527f50656e64696e6720626c6f636b206e6f7420666f756e642e0000000000000000604082015260600190565b60208082526028908201527f426c6f636b20706172656e74206e6f7420696e207468652063616e6f6e696361604082015267361031b430b4b71760c11b606082015260800190565b602080825260139082015272105b1c9958591e481a5b9a5d1a585b1a5e9959606a1b604082015260600190565b6020808252818101527f426c6f636b206e6f74206669727374206368696c64206f6620706172656e742e604082015260600190565b6020808252601d908201527f426c6f636b206861732070656e64696e67206368616c6c656e6765732e000000604082015260600190565b602080825260149082015273416c726561647920696e697469616c697a65642160601b604082015260600190565b81518152602080830151908201526040808301516001600160a01b0316908201526060918201519181019190915260800190565b600061014082019050825182526020830151602083015260408301516040830152606083015160608301526080830151608083015260a083015160a083015260c083015160c083015260e083015160e083015261010080840151611615828501826111b0565b505061012092830151919092015290565b918252602082015260400190565b60405181810167ffffffffffffffff8111828210171561165357600080fd5b604052919050565b6001600160a01b0381168114610ce957600080fdfea26469706673582212201522d8040ecbc309c8a640418d726d371c15ddcbf17a1df4d4e980795295375c64736f6c634300060b0033") as any;
    }
}
export var ChainPegAbi = abi;