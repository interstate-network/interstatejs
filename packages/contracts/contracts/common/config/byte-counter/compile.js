const { parser } = require('@aztec/huff');
const emasm = require('emasm');
const makeConstructor = require('emasm/macros/make-constructor');
const addHexPrefix = (s) => s.substr(0, 2) === '0x' ? s : '0x' + s;

function compileHuff(dir, filename, macro) {
	const { inputMap, macros, jumptables } = parser.parseFile(filename, dir);
	const {
		data: { bytecode, sourcemap }
	} = parser.processMacro(macro, 0, [], macros, inputMap, jumptables);
	return {
		bytecode: emasm(makeConstructor([ 'bytes:intermediate', [ addHexPrefix(bytecode) ]])),
		deployedBytecode: addHexPrefix(bytecode),
		sourcemap
	}
}

module.exports = () => compileHuff(__dirname, 'byte-counter.huff', 'MAIN');