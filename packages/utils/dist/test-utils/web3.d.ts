export declare function getWeb3(): Promise<{
    accounts: any;
    from: any;
    web3: any;
}>;
declare type DeploymentsRecord = {
    [key: string]: {
        [key: string]: any;
    };
};
export declare class Deployer {
    web3: any;
    from: any;
    contracts: any;
    deployments: DeploymentsRecord;
    constructor(web3: any, from: any, contracts: any);
    toContractFields(file: string, contract: string): {
        abi: any;
        bytecode: any;
        linkReferences: any;
    };
    deployAndLinkRecursive(file: string, contract: string, returnData?: boolean): Promise<any>;
    deploy(file: string, contract?: string, value?: string | number, args?: Array<any>): Promise<any>;
}
export {};
