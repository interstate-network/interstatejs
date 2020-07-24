const { parser } = require('huff.js');
const emasm = require('emasm');
const makeConstructor = require('emasm/macros/make-constructor');
const addHexPrefix = (s) => s.substr(0, 2) === '0x' ? s : '0x' + s;

export function compile(dir: string, filename: string, macroName: string) {
	const { inputMap, macros, jumptables } = parser.parseFile(filename, dir);
	const {
		data: { bytecode, sourcemap }
	} = parser.processMacro(macroName, 0, [], macros, inputMap, jumptables);
  return { bytecode: addHexPrefix(bytecode), sourcemap };
}

export function compileConstructor(dir: string, filename: string, macroName: string) {
  const { bytecode, sourcemap } = compile(dir, filename, macroName);
  return {
    bytecode: emasm(makeConstructor([ 'bytes:intermediate', [ addHexPrefix(bytecode) ]])),
    deployedBytecode: addHexPrefix(bytecode),
		sourcemap
	}
}