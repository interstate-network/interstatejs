import fs from 'fs';
const solc = require("solc");
const path = require("path");

function toSource(dir, fileName) {
  let name = fileName.replace(".sol", ""); // works with either contract name or file name
  return {
    [`${name}.sol`]: {
      content: fs.readFileSync(path.resolve(dir, `${name}.sol`), "utf8")
    }
  };
}

export function compile(dir: string, fileName?: string | string[], importPath?: string) {
  if (!importPath) importPath = dir;
  function findImports(_path) {
    let fP = _path.match(/\//g)
      ? path.resolve(importPath, _path)
      : path.resolve(dir, _path);
    // console.log(`Imported ${fP}`);
    if (fs.existsSync(fP)) return { contents: fs.readFileSync(fP, "utf8") };
    fP = _path.match(/\//g)
      ? path.resolve(dir, _path)
      : path.resolve(importPath, _path);
    if (fs.existsSync(fP)) return { contents: fs.readFileSync(fP, "utf8") };
    else return { error: "File not found" };
  }
  let sources = {};
  
  if (!fileName) fileName = fs.readdirSync(dir).filter(x => /\.sol/g.exec(x));

  if (Array.isArray(fileName))
    for (let source of fileName)
      sources = { ...sources, ...toSource(dir, source) };
  else sources = toSource(dir, fileName);

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

  const output = JSON.parse(
    solc.compile(JSON.stringify(input), { import: findImports })
  );
  if (output.errors) {
    let doThrow;
    for (let err of output.errors) {
      console.log(err);
      if (err.type != 'Warning') doThrow = true;
    }
    if (doThrow) throw new Error();
  }
  return output.contracts;
}