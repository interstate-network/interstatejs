import { getDefaultHashes, getDefaultRoot } from '../src/utils';

console.log('160:', getDefaultRoot(160).toString('hex'))
console.log('256:', getDefaultRoot(256).toString('hex'))
console.log('16:', getDefaultRoot(16).toString('hex'))
// const root = getDefaultHashes(160)[0]