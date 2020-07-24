const { Buffer } = require('safe-buffer');
const { keccak256, addHexPrefix, toBuffer, stripHexPrefix, bufferToHex } = require('ethereumjs-util');
const rlp = require('rlp');
const Trie = require('merkle-patricia-tree');
const SecureTrie = require('merkle-patricia-tree/secure');
const TrieNode = require('merkle-patricia-tree/trieNode');
const { matchingNibbleLength } = require('merkle-patricia-tree/util');
const { toBuf32 } = require('./to');

const castToBaseTrie = (secureTrie) => {
  return new Trie(secureTrie.db, secureTrie.root);
};

const lib = (trie) => ({
  del: (key) => new Promise((resolve, reject) => {
    trie.put(
      toBuffer(key), null,
      (err, result) => err ? reject(err) : resolve(result)
    )
  }),
  get: (key) => new Promise((resolve, reject) =>
    trie.get(
      toBuffer(key),
      (err, result) => err ? reject(err) : resolve(result)
    )
  ),
  put: (key, val) => new Promise((resolve, reject) => 
    trie.put(
      toBuffer(key),
      toBuffer(val),
      (err, result) => err ? reject(err) : resolve(result)
    )
  ),
  prove: async (key) => {
    const isSecure = Object.getPrototypeOf(trie) === SecureTrie.prototype; // proper technique to see if its secure or not, MPT does weird inheritance stuff that I also just can afford to be ignorant of
    const baseTrie = isSecure ? castToBaseTrie(trie) : trie;
    try {
      key = isSecure ? keccak256(key) : key;
      const nibbles = TrieNode.stringToNibbles(key);
      const simpleProof = await new Promise((resolve, reject) => baseTrie.findPath(
          key,
          (err, _, __, proof) => err
            ? reject(err)
            : resolve(proof.map((v) => v.serialize()))
        )
      );
      let divergentSearch, divergent, nibblesPassed = 0;
      let i = 0;
      for (; i < simpleProof.length; i++) {
        const node = new TrieNode(rlp.decode(simpleProof[i]));
        if (node.type === 'branch') {
          if (nibblesPassed === nibbles.length) {
            divergentSearch = {
              node,
              nibblesPassed,
              nibble: 0x10
            };
            break;
          }
          if (node.raw[nibbles[nibblesPassed]].length === 0) break; 
          nibblesPassed++;
        } else {
          if (matchingNibbleLength(nibbles.slice(nibblesPassed), node.key) !== node.key.length) break;
          nibblesPassed += node.key.length;
          if (nibblesPassed === nibbles.length) {
            if (!i) break;
            // console.log(nibbles);
            divergentSearch = {
              node: new TrieNode(rlp.decode(simpleProof[i - 1])),
              nibble: nibbles[nibblesPassed - node.key.length - 1],
              nibblesPassed: nibblesPassed - node.key.length - 1
            }
            break;
          }
        }
      }
      if (i === simpleProof.length) throw Error('node not found');
      if (divergentSearch) {
        // console.log(divergentSearch.nibble);
        if (divergentSearch.node.type === 'branch') {
          let count = 0, divergentNibble;
          for (let i = 0; i < 0x11; i++) {
            if (i !== divergentSearch.nibble && divergentSearch.node.raw[i].length !== 0) {
              count++;
              divergentNibble = i;
              if (count == 2) break;
            }
          }
          if (count === 1) {
            const raw = divergentSearch.node.raw[divergentNibble];
            if (!Array.isArray(raw)) {
              // console.log(divergentNibble)
              let extendPath = nibbles.slice(0, divergentSearch.nibblesPassed).concat(divergentNibble).map((v) => v.toString(16));
              if (extendPath.length & 0x1) extendPath.push('0');
              divergent = await new Promise((resolve, reject) => baseTrie.findPath(
                  toBuffer(addHexPrefix(extendPath.join(''))),
                  (err, n, m, path) => err ? reject(err) : resolve(path[path.length - 1].serialize()))
                );
            }
          }
        }
      }
      return bufferToHex(Buffer.concat([
        Buffer.from([ divergent ? 0xfe : 0xff ]),
        rlp.encode((divergent ? [ rlp.decode(divergent) ] : []).concat(simpleProof.filter((v) => v.length >= 0x20).map((v) => rlp.decode(v))))
      ]));
    } catch (e) {
      /*
      --- Original ---
      return bufferToHex(Buffer.concat([
        Buffer.from([0xff]),
        rlp.encode((await new Promise((resolve, reject) =>
          trie.findPath(
            toBuffer(key),
            (err, _, __, path) => err ? reject(err) : resolve(path)))).map((v) => v.raw))
      ]));
      */
      const pathData = await new Promise(
          (resolve, reject) =>
          baseTrie.findPath(
              toBuffer(key),
              (err, _, __, path) => err ? reject(err) : resolve(path)
          )
      );
      const encoded = pathData
        ? rlp.encode(pathData.map(v => v.raw))
        : rlp.encode(null);
      return bufferToHex(Buffer.concat([
          Buffer.from([0xff]),
          encoded
      ]));
    }
  }
});

module.exports = lib;
