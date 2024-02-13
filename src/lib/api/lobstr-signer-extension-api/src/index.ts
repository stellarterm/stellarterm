import { getPublicKey } from "./getPublicKey";
import { signTransaction } from "./signTransaction";
import { isConnected } from "./isConnected";
import { isAllowed } from "./isAllowed";
import { setAllowed } from "./setAllowed";

export const isBrowser = typeof window !== "undefined";

export {
  getPublicKey,
  signTransaction,
  isConnected,
  isAllowed,
  setAllowed,
};
export default {
  getPublicKey,
  signTransaction,
  isConnected,
  isAllowed,
  setAllowed,
};
