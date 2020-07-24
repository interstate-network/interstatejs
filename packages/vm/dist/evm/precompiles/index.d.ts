import { PrecompileInput, PrecompileFunc } from './types';
export { PrecompileInput, PrecompileFunc };
interface Precompiles {
    [key: string]: PrecompileFunc;
}
export declare const ripemdPrecompileAddress = "0000000000000000000000000000000000000003";
export declare const precompiles: Precompiles;
export declare function getPrecompile(address: string): PrecompileFunc;
