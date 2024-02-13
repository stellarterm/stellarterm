import { getPublicKey } from "./getPublicKey";
import { signTransaction } from "./signTransaction";
import { isConnected } from "./isConnected";
import { isAllowed } from "./isAllowed";
import { setAllowed } from "./setAllowed";
export declare const isBrowser: boolean;
export { getPublicKey, signTransaction, isConnected, isAllowed, setAllowed, };
declare const _default: {
    getPublicKey: () => Promise<string>;
    signTransaction: (transactionXdr: string) => Promise<string>;
    isConnected: () => Promise<boolean>;
    isAllowed: () => Promise<boolean>;
    setAllowed: () => Promise<boolean>;
};
export default _default;
