export declare function randomHexString(size: any): string;
export declare function randomHexBuffer(size: any): any;
export declare const randomAccount: () => {
    privateKey: any;
    address: string;
};
export declare const randomInt: (bytes: any) => number;
export declare const randomFromArray: <T>(arr: T[]) => T;
