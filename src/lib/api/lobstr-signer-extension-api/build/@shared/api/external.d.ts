import { GetPublicKeyResponse } from "@shared/constants/types";
export declare const requestPublicKey: () => Promise<GetPublicKeyResponse>;
export declare const signTransaction: (transactionXdr: string, connectionKey: string) => Promise<string>;
export declare const requestConnectionStatus: () => Promise<boolean>;
export declare const requestAllowedStatus: () => Promise<boolean>;
export declare const setAllowedStatus: () => Promise<boolean>;
