import { setAllowedStatus } from "@shared/api/external";
import { isBrowser } from ".";

export const setAllowed = (): Promise<boolean> =>
  isBrowser ? setAllowedStatus() : Promise.resolve(false);
