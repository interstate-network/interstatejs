const path = require('path');
import { compile, compileConstructor } from './easy-huff';
const vmPath = path.join(__dirname, '..', 'huff_modules');

export function compileHypervisor() {
  return compileConstructor(
    vmPath,
    'hypervisor.huff',
    'INITIALIZE_HYPERVISOR'
  );
}

export function compileCalldataTest() {
  return compile(
    vmPath,
    'test/test-calldata.huff',
    'TEST_CALLDATA'
  );
}