"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeStructAsParameters = exports.convertUint = exports.convertBytes32 = exports.convertAddress = exports.encodeStructAsParameters = exports.encodeStruct = exports.abiObjectToArray = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const ABI = require('web3-eth-abi');
const toHex_1 = require("./toHex");
function abiObjectToArray(obj) {
    return Object.keys(obj).reduce((arr, k) => ([
        ...arr, obj[k]
    ]), []);
}
exports.abiObjectToArray = abiObjectToArray;
const abiDefToFieldsArray = (abiDef) => {
    const [structName] = Object.keys(abiDef);
    const abi = abiDef[structName];
    return Object.keys(abi);
};
const abiDefToTypesArray = (abiDef) => {
    const [structName] = Object.keys(abiDef);
    const abi = abiDef[structName];
    const keys = Object.keys(abi);
    return keys.reduce((arr, key) => ([...arr, abi[key]]), []);
};
const fieldToAbiCompatible = (field) => {
    if (typeof field == 'boolean')
        return field;
    if (Array.isArray(field) && !Buffer.isBuffer(field))
        return field;
    if (typeof field == 'string')
        return field;
    return toHex_1.toHex(field);
};
const objectToAbiCompatible = (obj, abiDef) => {
    const [structName] = Object.keys(abiDef);
    const abi = abiDef[structName];
    const keys = Object.keys(abi);
    return keys.reduce((res, key) => (Object.assign(Object.assign({}, res), { [key]: fieldToAbiCompatible(obj[key]) })), {});
};
function encodeStruct(obj, abiDef) {
    return ABI.encodeParameter(abiDef, objectToAbiCompatible(obj, abiDef));
}
exports.encodeStruct = encodeStruct;
function encodeStructAsParameters(obj, abiDef) {
    const [structName] = Object.keys(abiDef);
    const abi = abiDef[structName];
    const keys = Object.keys(abi);
    const abiTypes = [];
    const abiParams = [];
    for (let key of keys) {
        const val = obj[key];
        const abiType = abi[key];
        abiTypes.push(abiType);
        if (typeof val == 'boolean')
            abiParams.push(val);
        else if (abiType.includes('[]')) {
            abiParams.push(val);
        }
        else
            abiParams.push(toHex_1.toHex(val));
    }
    return ABI.encodeParameters(abiTypes, abiParams);
}
exports.encodeStructAsParameters = encodeStructAsParameters;
function convertAddress(addr) {
    return new ethereumjs_util_1.BN(addr.slice(2), 'hex');
}
exports.convertAddress = convertAddress;
function convertBytes32(b32) {
    return new ethereumjs_util_1.BN(b32.slice(2), 'hex');
}
exports.convertBytes32 = convertBytes32;
function convertUint(val) {
    if (val.slice(0, 2) == '0x')
        return new ethereumjs_util_1.BN(val.slice(2), 'hex');
    return new ethereumjs_util_1.BN(val);
}
exports.convertUint = convertUint;
function decodeStructAsParameters(data, abiDef) {
    const abiTypes = abiDefToTypesArray(abiDef);
    const abiParams = abiObjectToArray(ABI.decodeParameters(abiTypes, data));
    const fields = abiDefToFieldsArray(abiDef);
    const res = {};
    for (let i = 0; i < abiParams.length; i++) {
        const param = abiParams[i];
        const _type = abiTypes[i];
        const field = fields[i];
        switch (_type) {
            case 'address':
                res[field] = convertAddress(param);
                break;
            case 'bytes32':
                res[field] = convertBytes32(param);
                break;
            case 'bytes':
                res[field] = ethereumjs_util_1.toBuffer(param);
                break;
            case 'bool':
                res[field] = Boolean(param);
                break;
            case 'uint256':
                res[field] = convertUint(param);
                break;
            default:
                res[field] = param;
        }
    }
    return res;
}
exports.decodeStructAsParameters = decodeStructAsParameters;
//# sourceMappingURL=accessWitness.js.map