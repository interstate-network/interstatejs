"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
const fs_1 = __importDefault(require("fs"));
const solc = require("solc");
const path = require("path");
function toSource(dir, fileName) {
    let name = fileName.replace(".sol", ""); // works with either contract name or file name
    return {
        [`${name}.sol`]: {
            content: fs_1.default.readFileSync(path.resolve(dir, `${name}.sol`), "utf8")
        }
    };
}
function compile(dir, fileName, importPath) {
    if (!importPath)
        importPath = dir;
    function findImports(_path) {
        let fP = _path.match(/\//g)
            ? path.resolve(importPath, _path)
            : path.resolve(dir, _path);
        // console.log(`Imported ${fP}`);
        if (fs_1.default.existsSync(fP))
            return { contents: fs_1.default.readFileSync(fP, "utf8") };
        fP = _path.match(/\//g)
            ? path.resolve(dir, _path)
            : path.resolve(importPath, _path);
        if (fs_1.default.existsSync(fP))
            return { contents: fs_1.default.readFileSync(fP, "utf8") };
        else
            return { error: "File not found" };
    }
    let sources = {};
    if (!fileName)
        fileName = fs_1.default.readdirSync(dir).filter(x => /\.sol/g.exec(x));
    if (Array.isArray(fileName))
        for (let source of fileName)
            sources = Object.assign(Object.assign({}, sources), toSource(dir, source));
    else
        sources = toSource(dir, fileName);
    const input = {
        language: "Solidity",
        sources,
        settings: {
            outputSelection: {
                "*": {
                    "*": [
                        "abi",
                        "evm.bytecode.object",
                        "evm.deployedBytecode.object",
                        "evm.bytecode.linkReferences"
                    ]
                }
            }
        }
    };
    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
    if (output.errors) {
        let doThrow;
        for (let err of output.errors) {
            console.log(err);
            if (err.type != 'Warning')
                doThrow = true;
        }
        if (doThrow)
            throw new Error();
    }
    return output.contracts;
}
exports.compile = compile;
