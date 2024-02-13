import { requestAllowedStatus } from "@shared/api/external";
import { isBrowser } from ".";

export const isAllowed = (): Promise<boolean> =>
  isBrowser ? requestAllowedStatus() : Promise.resolve(false);
