import { requestPublicKey } from "@shared/api/external";
import { GetPublicKeyResponse } from "@shared/constants/types";
import { CONNECTION_KEY } from "@shared/constants/services";
import { isBrowser } from ".";

export const getPublicKey = (): Promise<string> =>
  isBrowser ?
    requestPublicKey().then(({ publicKey, connectionKey }: GetPublicKeyResponse) => {
      window?.sessionStorage?.setItem(CONNECTION_KEY, connectionKey);
      return publicKey;
    }) :
    Promise.resolve("");
