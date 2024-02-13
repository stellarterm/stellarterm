import { requestConnectionStatus } from "@shared/api/external";
import { isBrowser } from ".";

export const isConnected = (): Promise<boolean> => {
  if (!isBrowser) return Promise.resolve(false);

  if (window.lobstrSignerExtension) {
    return Promise.resolve(window.lobstrSignerExtension);
  }

  return requestConnectionStatus();
};
