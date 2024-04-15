/* eslint-disable */
export function isIE() { return /*@cc_on!@*/false || !!document.documentMode; }
export function isEdge() { return !isIE() && !!window.StyleMedia; }
export function isChromium() { return !!window.chrome }
export function isEdgeChromium() { return isChromium() && (navigator.userAgent.indexOf("Edg") != -1) }
export function isOpera() { return (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0; }
export function isChrome() { return isChromium() && !isOpera() && !isEdgeChromium()}
export function isFirefox() { return typeof InstallTrigger !== 'undefined'; }
export function isSafari() { return /constructor/i.test(window.HTMLElement) || ((p) => { return p.toString() === '[object SafariRemoteNotification]'; })(!window.safari || (typeof safari !== 'undefined' && safari.pushNotification)); }

export function getBrowserName() {
    return isOpera() ? 'Opera' :
        isChrome() ? 'Chrome' :
        isFirefox() ? 'Firefox' :
        isEdgeChromium() ? 'Chromium Edge' :
        isEdge() ? 'Edge' :
        isSafari() ? 'Safari' :
        isIE() ? 'Internet Explorer' : 'Unknown browser';
}

export function isHttpConnectionUsed() {
    return window.location.protocol === 'http:';
}

export function isWindowsOS() {
    return (window.navigator.platform === 'Win32' || window.navigator.platform === 'Win64');
}
