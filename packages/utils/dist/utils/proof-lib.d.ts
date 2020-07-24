export = lib;
declare function lib(trie: any): {
    del: (key: any) => Promise<any>;
    get: (key: any) => Promise<any>;
    put: (key: any, val: any) => Promise<any>;
    prove: (key: any) => Promise<string>;
};
