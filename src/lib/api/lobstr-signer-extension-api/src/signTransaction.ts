import { signTransaction as signTransactionService } from "@shared/api/external";
import { CONNECTION_KEY } from "@shared/constants/services";
import { isBrowser } from ".";

export const signTransaction = (
  transactionXdr: string,
): Promise<string> => {
  if (!isBrowser) {
    return Promise.resolve("");
  }

  const connectionKey = window?.sessionStorage?.getItem(CONNECTION_KEY) || '';

  return signTransactionService(transactionXdr, connectionKey);
};
