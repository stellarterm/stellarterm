import { Response } from '@shared/constants/types';
import { EXTERNAL_SERVICE_TYPES, SERVICE_TYPES } from "../../constants/services";
interface Msg {
    [key: string]: any;
    type: EXTERNAL_SERVICE_TYPES | SERVICE_TYPES;
}
export declare const sendMessageToContentScript: (msg: Msg) => Promise<any>;
export declare const sendMessageToBackground: (msg: Msg) => Promise<Response>;
export {};
