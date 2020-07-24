"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockStateProofLibAbi = exports.MockStateProofLib = void 0;
const contract_1 = require("web3x/contract");
const MockStateProofLibAbi_1 = __importDefault(require("./MockStateProofLibAbi"));
class MockStateProofLib extends contract_1.Contract {
    constructor(eth, address, options) {
        super(eth, MockStateProofLibAbi_1.default, address, options);
    }
    deploy() {
        return super.deployBytecode("0x608060405234801561001057600080fd5b5060405161001d9061005f565b604051809103906000f080158015610039573d6000803e3d6000fd5b50600080546001600160a01b0319166001600160a01b039290921691909117905561006d565b610dbb8062001fa583390190565b611f28806200007d6000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c806387734c421161005b57806387734c421461010a578063a86902671461011d578063e9bc15201461013e578063eebbf3221461015157610088565b8063046c24a41461008d5780630a5a8365146100b657806336070b45146100c957806361d18ef2146100e9575b600080fd5b6100a061009b3660046118a1565b610171565b6040516100ad9190611bd6565b60405180910390f35b6100a06100c43660046119e8565b610199565b6100dc6100d73660046117eb565b6101c2565b6040516100ad9190611e0c565b6100fc6100f7366004611769565b6101ec565b6040516100ad929190611bdf565b6100a0610118366004611842565b610219565b61013061012b366004611842565b61023c565b6040516100ad929190611c88565b6100a061014c366004611842565b61026c565b61016461015f36600461196e565b610286565b6040516100ad9190611c9c565b6000805461018d906001600160a01b03168988888888886102a1565b98975050505050505050565b60006101a36112c4565b6101ac84610325565b90506101b8818461045e565b9150505b92915050565b6101ca61134a565b6000546101e2906001600160a01b0316858585610520565b90505b9392505050565b60008054819061020a906001600160a01b0316898989898989610602565b91509150965096945050505050565b60008054610233906001600160a01b03168686868661065b565b95945050505050565b600061024661134a565b60005461025f906001600160a01b031687878787610699565b9150915094509492505050565b60008054610233906001600160a01b0316868686866106e9565b6000546060906101e2906001600160a01b03168585856107f5565b60006102ab611371565b6102b4866108ee565b90506102be611371565b6102c7866108ee565b90506102d161134a565b6102de836020015161090a565b905060606102f28c846020015189896107f5565b90506103018c8b848685610a05565b6103158c8c61030e610af9565b8588610b35565b9c9b505050505050505050505050565b61032d6112c4565b610335611392565b61033d6113b0565b6103456113ce565b606061034f6113ec565b6060878060200190518101906103659190611632565b9550955095509550955095506040518061020001604052808760006003811061038a57fe5b60200201518152602001876001600381106103a157fe5b602090810291909101518252604089810151158383015288516001600160a01b03908116828501528983015181166060808601919091528a83015182166080860152808b015190911660a0850152885160c08501529188015160e084015287015161010083015286015161012082015261014001856004602002015181526020018481526020018360006002811061043557fe5b60209081029190910151825293840151938101939093526040909201529450505050505b919050565b60008261018001515182111561048f5760405162461bcd60e51b815260040161048690611caf565b60405180910390fd5b8161049c575081516101bc565b60001982015b606084610180015182815181106104b557fe5b602002602001015190506000602082015190508060f414806104d757508060f1145b806104e257508060f2145b806104ed5750806055145b1561050057506040015191506101bc9050565b8261050c575050610517565b5050600019016104a2565b50509051919050565b61052861134a565b610530611371565b610539836108ee565b80516020820151604080840151905163b096267360e01b81529394506001600160a01b03808b169463b09626739461057f948c9460a094929391928d1691600401611c4b565b60206040518083038186803b15801561059757600080fd5b505afa1580156105ab573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105cf9190611720565b6105eb5760405162461bcd60e51b815260040161048690611ce6565b6105f8816020015161090a565b9695505050505050565b60008061060d611371565b610616856108ee565b905061062061134a565b61062d826020015161090a565b905061063c8b828a8a89610c00565b935061064b8b8b8b8486610b35565b9250505097509795505050505050565b600080600061066d8888888888610d0f565b915091508161068e5760405162461bcd60e51b815260040161048690611d13565b979650505050505050565b60006106a361134a565b6106ab611371565b6106b4856108ee565b90506106c3816020015161090a565b6020810180518601905291506106dc8888888585610b35565b9250509550959350505050565b60006106f3611371565b6106fc846108ee565b905061070661134a565b610713826020015161090a565b905083816060018181525050600080896001600160a01b0316637022c2c48a60a08760000151886020015161074789610d82565b8e6001600160a01b03168b604001516040518863ffffffff1660e01b81526004016107789796959493929190611bed565b604080518083038186803b15801561078f57600080fd5b505afa1580156107a3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107c7919061173c565b91509150816107e85760405162461bcd60e51b815260040161048690611da7565b9998505050505050505050565b60606107ff611371565b610808846108ee565b905061081261140a565b61081b86610ee3565b9050600080886001600160a01b0316637022c2c484600001516010876000015188602001518b89602001518b604001516040518863ffffffff1660e01b815260040161086d9796959493929190611bed565b604080518083038186803b15801561088457600080fd5b505afa158015610898573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108bc919061173c565b91509150816108dd5760405162461bcd60e51b815260040161048690611dd5565b6107e8818460200151600101610f47565b6108f6611371565b818060200190518101906101bc9190611a5e565b61091261134a565b815161092757610920610f85565b9050610459565b81516020141561096457602082015180156109545760405162461bcd60e51b815260040161048690611d70565b61095c610f85565b915050610459565b6000806000806109ad565b8051600090600183019060f81c60808110801561098e578193506109a6565b60808203835160088202610100031c94508084019350505b5050915091565b602086015160f81c860160d519016109c48161096f565b915094506109d18161096f565b6001810151602290910151604080516080810182529889526020890193909352918701526060860152509295945050505050565b600080866001600160a01b0316637022c2c4866040015161010087600001518860200151888c604051602001610a3b9190611bd6565b60408051601f198184030181528282528051602090910120908d01516001600160e01b031960e08a901b168352610a79979695949392600401611bed565b604080518083038186803b158015610a9057600080fd5b505afa158015610aa4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ac8919061173c565b9150915081610ae95760405162461bcd60e51b815260040161048690611d41565b6040909401939093525050505050565b600080610b04610ff3565b604051602001610b149190611bd6565b60408051601f19818403018152919052805160209091012060601c92915050565b6000806000876001600160a01b0316637022c2c48860a087600001518860200151610b5f8b610d82565b8c6001600160a01b03168b604001516040518863ffffffff1660e01b8152600401610b909796959493929190611bed565b604080518083038186803b158015610ba757600080fd5b505afa158015610bbb573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bdf919061173c565b915091508161068e5760405162461bcd60e51b815260040161048690611da7565b6000610c0a611371565b610c13836108ee565b9050600080886001600160a01b0316637022c2c48960400151610100866000015187602001518b604051602001610c4a9190611bd6565b6040516020818303038152906040528d60001c8a604001516040518863ffffffff1660e01b8152600401610c849796959493929190611bed565b604080518083038186803b158015610c9b57600080fd5b505afa158015610caf573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cd3919061173c565b9150915081610cf45760405162461bcd60e51b815260040161048690611d41565b60409097019690965260209081015101519695505050505050565b600080610d1a611371565b610d23856108ee565b9050610d2d61134a565b610d3a826020015161090a565b9050848160200151101593508315610d7257602081018051869003905280516001018152610d6b8989898486610b35565b9250610d76565b8792505b50509550959350505050565b80516020820151604083015160608481015190939291906000610da485610ff9565b90506000610db185610ff9565b9050600060808710610dc4576001610dc7565b60005b60ff169050600060808710610ddd576001610de0565b60005b60ff1690506044828501820184010160608167ffffffffffffffff81118015610e0857600080fd5b506040519080825280601f01601f191660200182016040528015610e33576020820181803683370190505b5090506020810160f8815360010160011983018153600101610e9f565b80828015610e7a578560800182536001820191508460088702610100031b82528582019150610e96565b848015610e8957858353610e8e565b608083535b506001820191505b50949350505050565b610eab878c8784610e50565b9050610eb9868b8684610e50565b905060a081536001810189905260210160a081536001019690965250939998505050505050505050565b610eeb61140a565b610ef482611292565b15610f335750604080518082019091527f2def10d13dd169f550f578bda343d9717a138562e0093b380a1120789d53cf10815260006020820152610459565b818060200190518101906101bc9190611a2b565b6060604051806040016040528084815260200183815250604051602001610f6e9190611e1a565b604051602081830303815290604052905092915050565b610f8d61134a565b5060408051608081018252600080825260208201527fa9a4da177ac3f81cfe85a6767678aabb095aa306e72ab73f5cf0559c56d0a530918101919091527fc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470606082015290565b61c35590565b60008161100857506001610459565b6001600160f81b031982161561102057506020610459565b60ff60f01b8216156110345750601f610459565b60ff60e81b8216156110485750601e610459565b60ff60e01b82161561105c5750601d610459565b60ff60d81b8216156110705750601c610459565b60ff60d01b8216156110845750601b610459565b60ff60c81b8216156110985750601a610459565b60ff60c01b8216156110ac57506019610459565b60ff60b81b8216156110c057506018610459565b60ff60b01b8216156110d457506017610459565b60ff60a81b8216156110e857506016610459565b60ff60a01b8216156110fc57506015610459565b60ff60981b82161561111057506014610459565b60ff60901b82161561112457506013610459565b60ff60881b82161561113857506012610459565b60ff60801b82161561114c57506011610459565b60ff60781b82161561116057506010610459565b60ff60701b8216156111745750600f610459565b60ff60681b8216156111885750600e610459565b60ff60601b82161561119c5750600d610459565b60ff60581b8216156111b05750600c610459565b60ff60501b8216156111c45750600b610459565b69ff0000000000000000008216156111de5750600a610459565b68ff00000000000000008216156111f757506009610459565b67ff0000000000000082161561120f57506008610459565b66ff00000000000082161561122657506007610459565b65ff000000000082161561123c57506006610459565b64ff0000000082161561125157506005610459565b63ff00000082161561126557506004610459565b62ff000082161561127857506003610459565b61ff0082161561128a57506002610459565b506001919050565b60008151600014156112a657506001610459565b8151602014156112bc5750602081015115610459565b506000919050565b604080516102008101825260008082526020820181905291810182905260608082018390526080820183905260a0820183905260c0820183905260e08201839052610100820183905261012082018390526101408201839052610160820183905261018082018190526101a082018390526101c08201929092526101e081019190915290565b60408051608081018252600080825260208201819052918101829052606081019190915290565b60405180606001604052806000815260200160608152602001606081525090565b60405180606001604052806003906020820280368337509192915050565b60405180608001604052806004906020820280368337509192915050565b6040518060a001604052806005906020820280368337509192915050565b60405180604001604052806002906020820280368337509192915050565b604080518082019091526000808252602082015290565b80356101bc81611ecc565b600082601f83011261143c578081fd5b6114466080611e31565b905080828460808501111561145a57600080fd5b60005b600481101561148657815161147181611ecc565b8352602092830192919091019060010161145d565b50505092915050565b600082601f83011261149f578081fd5b6114a96040611e31565b90508082846040850111156114bd57600080fd5b60005b60028110156114865781518352602092830192909101906001016114c0565b600082601f8301126114ef578081fd5b81516115026114fd82611e58565b611e31565b818152915060208083019084810160005b8481101561153c5761152a888484518a01016115e5565b84529282019290820190600101611513565b505050505092915050565b600082601f830112611557578081fd5b61156160a0611e31565b905080828460a08501111561157557600080fd5b60005b6005811015611486578151835260209283019290910190600101611578565b600082601f8301126115a7578081fd5b81356115b56114fd82611e78565b91508082528360208285010111156115cc57600080fd5b8060208401602084013760009082016020015292915050565b600082601f8301126115f5578081fd5b81516116036114fd82611e78565b915080825283602082850101111561161a57600080fd5b61162b816020840160208601611e9c565b5092915050565b600080600080600080610200878903121561164b578182fd5b87601f880112611659578182fd5b6116636060611e31565b808860608a018b811115611675578586fd5b855b6003811015611696578251855260209485019490920191600101611677565b508299506116a48c8261142c565b9850505050506116b78860e08901611547565b935061018087015167ffffffffffffffff808211156116d4578384fd5b6116e08a838b016114df565b94506116f08a6101a08b0161148f565b93506101e0890151915080821115611706578283fd5b5061171389828a016115e5565b9150509295509295509295565b600060208284031215611731578081fd5b81516101e581611ee4565b6000806040838503121561174e578182fd5b825161175981611ee4565b6020939093015192949293505050565b60008060008060008060c08789031215611781578384fd5b86359550602087013561179381611ecc565b94506040870135935060608701359250608087013567ffffffffffffffff808211156117bd578384fd5b6117c98a838b01611597565b935060a08901359150808211156117de578283fd5b5061171389828a01611597565b6000806000606084860312156117ff578081fd5b83359250602084013561181181611ecc565b9150604084013567ffffffffffffffff81111561182c578182fd5b61183886828701611597565b9150509250925092565b60008060008060808587031215611857578182fd5b84359350602085013561186981611ecc565b9250604085013567ffffffffffffffff811115611884578283fd5b61189087828801611597565b949793965093946060013593505050565b600080600080600080600060e0888a0312156118bb578485fd5b873596506118cc8960208a01611421565b955060408801359450606088013567ffffffffffffffff808211156118ef578283fd5b6118fb8b838c01611597565b955060808a0135915080821115611910578283fd5b61191c8b838c01611597565b945060a08a0135915080821115611931578283fd5b61193d8b838c01611597565b935060c08a0135915080821115611952578283fd5b5061195f8a828b01611597565b91505092959891949750929550565b600080600060608486031215611982578081fd5b833567ffffffffffffffff80821115611999578283fd5b6119a587838801611597565b945060208601359150808211156119ba578283fd5b6119c687838801611597565b935060408601359150808211156119db578283fd5b5061183886828701611597565b600080604083850312156119fa578182fd5b823567ffffffffffffffff811115611a10578283fd5b611a1c85828601611597565b95602094909401359450505050565b600060408284031215611a3c578081fd5b611a466040611e31565b82518152602083015160208201528091505092915050565b60006020808385031215611a70578182fd5b825167ffffffffffffffff80821115611a87578384fd5b81850160608188031215611a99578485fd5b611aa36060611e31565b9250805183528381015182811115611ab9578586fd5b611ac5888284016115e5565b8585015250604081015182811115611adb578586fd5b019050601f81018613611aec578384fd5b8051611afa6114fd82611e58565b81815284810190838601868402850187018a1015611b16578788fd5b8794505b83851015611b38578051835260019490940193918601918601611b1a565b50604085015250919695505050505050565b6000815180845260208085019450808401835b83811015611b7957815187529582019590820190600101611b5d565b509495945050505050565b60008151808452611b9c816020860160208601611e9c565b601f01601f19169290920160200192915050565b805182526020810151602083015260408101516040830152606081015160608301525050565b90815260200190565b918252602082015260400190565b600088825287602083015286604083015260e06060830152611c1260e0830187611b84565b8281036080840152611c248187611b84565b8560a085015283810360c0850152611c3c8186611b4a565b9b9a5050505050505050505050565b600087825286602083015285604083015260c06060830152611c7060c0830186611b84565b84608084015282810360a08401526107e88185611b4a565b82815260a081016101e56020830184611bb0565b6000602082526101e56020830184611b84565b6020808252601a908201527f5265636f726420696e646578206f7574206f662072616e67652e000000000000604082015260600190565b60208082526013908201527224b73b30b634b21039ba30ba3290383937b7b360691b604082015260600190565b602080825260149082015273496e73756666696369656e742062616c616e636560601b604082015260600190565b60208082526015908201527424b73b30b634b21039ba37b930b3b290383937b7b360591b604082015260600190565b60208082526019908201527f496e76616c6964206163636f756e7420656e636f64696e672e00000000000000604082015260600190565b60208082526014908201527324b73b30b634b21039ba30ba3290383937b7b31760611b604082015260600190565b60208082526018908201527f496e76616c69642065786974206c6561662070726f6f662e0000000000000000604082015260600190565b608081016101bc8284611bb0565b815181526020918201519181019190915260400190565b60405181810167ffffffffffffffff81118282101715611e5057600080fd5b604052919050565b600067ffffffffffffffff821115611e6e578081fd5b5060209081020190565b600067ffffffffffffffff821115611e8e578081fd5b50601f01601f191660200190565b60005b83811015611eb7578181015183820152602001611e9f565b83811115611ec6576000848401525b50505050565b6001600160a01b0381168114611ee157600080fd5b50565b8015158114611ee157600080fdfea2646970667358221220ad89749504427f49488aa68f0ab2bed979c67dc63a247a0de20940da73b100ea64736f6c634300060b0033608060405234801561001057600080fd5b5060405161001d9061005f565b604051809103906000f080158015610039573d6000803e3d6000fd5b50600080546001600160a01b0319166001600160a01b039290921691909117905561006b565b60dc80610cdf83390190565b610c658061007a6000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80634516e2a41161005b5780634516e2a4146101005780637022c2c414610121578063b096267314610134578063db0787cb1461014757610088565b8063053914771461008d57806330d90a76146100ab5780633300872e146100cb57806340ff34ef146100e0575b600080fd5b610095610167565b6040516100a29190610b55565b60405180910390f35b6100be6100b936600461095d565b61017f565b6040516100a29190610b88565b6100d361020e565b6040516100a29190610b41565b6100f36100ee366004610859565b61021d565b6040516100a29190610ba3565b61011361010e3660046108c5565b610431565b6040516100a2929190610b93565b61011361012f3660046109d1565b6104dd565b6100be610142366004610a7c565b6105f1565b61015a610155366004610b02565b6106bd565b6040516100a29190610bac565b61016f610750565b6020610100026000826000543c90565b82516020840120604080518181526060818101835260009392909190602082018180368337019050509050602081016040820160208601865160005b818110156101fc57825160208401935060018b831c1615600181146101e5578187528886526101ec565b8887528186525b50506040852096506001016101bb565b50505097909214979650505050505050565b6000546001600160a01b031681565b6000818160606001830167ffffffffffffffff8111801561023d57600080fd5b50604051908082528060200260200182016040528015610267578160200160208202803683370190505b5090506060610278846001016106c4565b905060005b868110156102d85787878281811061029157fe5b90506020028101906102a39190610bba565b6040516102b1929190610b31565b60405180910390208382815181106102c557fe5b602090810291909101015260010161027d565b50600186141561030257816000815181106102ef57fe5b602002602001015194505050505061042b565b60028406600114156103415780838151811061031a57fe5b602002602001015182858151811061032e57fe5b6020026020010181815250506001840193505b600184111561040f576001929092019160005b600285048110156103b75761039883826002028151811061037157fe5b602002602001015184836002026001018151811061038b57fe5b602002602001015161071d565b8382815181106103a457fe5b6020908102919091010152600101610354565b506002840493506002840660011480156103d2575083600114155b1561040a578083815181106103e357fe5b60200260200101518285815181106103f757fe5b6020026020010181815250506001840193505b610341565b8160008151811061041c57fe5b60200260200101519450505050505b92915050565b8251602080850191909120855186830120604080518181526060808201835260009590929082018180368337019050509050602081016040820160208701875160005b818110156104c757825160208401935060018c831c1615600181146104aa578187529785526040808720998652862098976104bd565b9786528085526040808720998752862098975b5050600101610474565b5050505050888214935050509550959350505050565b60008060606104eb896106c4565b9050858051906020012091506000878051906020012090506060604067ffffffffffffffff8111801561051d57600080fd5b506040519080825280601f01601f191660200182016040528015610548576020820181803683370190505b50905060208101604082016020880160005b60018f038110156105d957600060018f600184011c1615600181146105885783519150602084019350610595565b6001830160200289015191505b5060018c831c1615600181146105bc578186529684526040808620998552852098966105cf565b9685528084526040808620998652852098965b505060010161055a565b505050508b8214945050505097509795505050505050565b600060606105fe876106c4565b855160208701206040805181815260608181018352939450919291906020820181803683370190505090506020810160408201602085016020880160018d0360005b818110156106a757600060018f600184011c16156001811461066b5784519150602085019450610675565b8260200286015191505b5060018d831c16156001811461069057818852898752610697565b8988528187525b5050604086209750600101610640565b5050509b9093149b9a5050505050505050505050565b1c60011690565b60608167ffffffffffffffff811180156106dd57600080fd5b50604051908082528060200260200182016040528015610707578160200160208202803683370190505b509050602082026000602083016000543c919050565b60008282604051602001610732929190610b23565b60405160208183030381529060405280519060200120905092915050565b604051806120000160405280610100906020820280368337509192915050565b600082601f830112610780578081fd5b813567ffffffffffffffff811115610796578182fd5b60208082026107a6828201610c08565b838152935081840185830182870184018810156107c257600080fd5b600092505b848310156107e55780358252600192909201919083019083016107c7565b505050505092915050565b600082601f830112610800578081fd5b813567ffffffffffffffff811115610816578182fd5b610829601f8201601f1916602001610c08565b915080825283602082850101111561084057600080fd5b8060208401602084013760009082016020015292915050565b6000806020838503121561086b578182fd5b823567ffffffffffffffff80821115610882578384fd5b81850186601f820112610893578485fd5b80359250818311156108a3578485fd5b86602080850283010111156108b6578485fd5b60200196919550909350505050565b600080600080600060a086880312156108dc578081fd5b85359450602086013567ffffffffffffffff808211156108fa578283fd5b61090689838a016107f0565b9550604088013591508082111561091b578283fd5b61092789838a016107f0565b9450606088013593506080880135915080821115610943578283fd5b5061095088828901610770565b9150509295509295909350565b60008060008060808587031215610972578384fd5b84359350602085013567ffffffffffffffff80821115610990578485fd5b61099c888389016107f0565b94506040870135935060608701359150808211156109b8578283fd5b506109c587828801610770565b91505092959194509250565b600080600080600080600060e0888a0312156109eb578182fd5b873596506020880135955060408801359450606088013567ffffffffffffffff80821115610a17578384fd5b610a238b838c016107f0565b955060808a0135915080821115610a38578384fd5b610a448b838c016107f0565b945060a08a0135935060c08a0135915080821115610a60578283fd5b50610a6d8a828b01610770565b91505092959891949750929550565b60008060008060008060c08789031215610a94578182fd5b863595506020870135945060408701359350606087013567ffffffffffffffff80821115610ac0578384fd5b610acc8a838b016107f0565b94506080890135935060a0890135915080821115610ae8578283fd5b50610af589828a01610770565b9150509295509295509295565b60008060408385031215610b14578182fd5b50508035926020909101359150565b918252602082015260400190565b6000828483379101908152919050565b6001600160a01b0391909116815260200190565b6120008101818360005b610100811015610b7f578151835260209283019290910190600101610b5f565b50505092915050565b901515815260200190565b9115158252602082015260400190565b90815260200190565b60ff91909116815260200190565b6000808335601e19843603018112610bd0578283fd5b8084018035925067ffffffffffffffff831115610beb578384fd5b60200192505036819003821315610c0157600080fd5b9250929050565b60405181810167ffffffffffffffff81118282101715610c2757600080fd5b60405291905056fea2646970667358221220635d1633c75d1561da4f91cdd3c3c3cdea624eb1b942c72b2fd21839e567a9e964736f6c634300060b00336080604052348015600f57600080fd5b50601660bb565b6040805160006020808301919091528251808303820181529183019092528051910120815260015b61010081101560b45781600182036101008110605657fe5b602002015182600183036101008110606a57fe5b60200201516040516020018083815260200182815260200192505050604051602081830303815290604052805190602001208282610100811060a857fe5b6020020152600101603e565b5061200081f35b60405180612000016040528061010090602082028036833750919291505056fe");
    }
}
exports.MockStateProofLib = MockStateProofLib;
exports.MockStateProofLibAbi = MockStateProofLibAbi_1.default;