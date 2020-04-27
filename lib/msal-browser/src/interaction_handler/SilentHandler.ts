/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { UrlString, AuthorizationCodeModule, StringUtils } from "@azure/msal-common";
import { InteractionHandler } from "./InteractionHandler";
import { BrowserConstants } from "../utils/BrowserConstants";
import { BrowserAuthError } from "../error/BrowserAuthError";
import { BrowserStorage } from "../cache/BrowserStorage";

export class SilentHandler extends InteractionHandler {

    private loadFrameTimeout: number;
    constructor(authCodeModule: AuthorizationCodeModule, storageImpl: BrowserStorage, configuredLoadFrameTimeout: number) {
        super(authCodeModule, storageImpl);
        this.loadFrameTimeout = configuredLoadFrameTimeout;
    }

    /**
     * Creates a hidden iframe to given URL using user-requested scopes as an id.
     * @param urlNavigate 
     * @param userRequestScopes
     */
    async initiateAuthRequest(requestUrl: string, userRequestScopes?: string): Promise<HTMLIFrameElement> {
        if (StringUtils.isEmpty(requestUrl)) {
            // Throw error if request URL is empty.
            this.authModule.logger.info("Navigate url is empty");
            throw BrowserAuthError.createEmptyNavigationUriError();
        }
        const frameName = userRequestScopes ? `msalTokenFrame${userRequestScopes}` : "msalTokenFrame";
        return this.loadFrameTimeout ? await this.loadFrame(requestUrl, frameName) : this.loadFrameSync(requestUrl, frameName);
    }

    /**
     * Monitors an iframe content window until it loads a url with a known hash, or hits a specified timeout.
     * @param iframeContentWindow 
     * @param timeout 
     * @param urlNavigate 
     */
    monitorFrameForHash(iframe: HTMLIFrameElement, timeout: number, urlNavigate: string): Promise<string> {
        const contentWindow = iframe.contentWindow;
        return new Promise((resolve, reject) => {
            const maxTicks = timeout / BrowserConstants.POLL_INTERVAL_MS;
            let ticks = 0;

            const intervalId = setInterval(() => {
                if (contentWindow.closed) {
                    // Window is closed
                    this.removeHiddenIframe(iframe);
                    clearInterval(intervalId);
                    reject(BrowserAuthError.createIframeClosedPrematurelyError());
                    return;
                }

                let href;
                try {
                    /*
                     * Will throw if cross origin,
                     * which should be caught and ignored
                     * since we need the interval to keep running while on STS UI.
                     */
                    href = contentWindow.location.href;
                } catch (e) {}

                /*
                 * Always run clock for silent calls
                 * as silent operations should be short,
                 * and to ensure they always at worst timeout.
                 */
                ticks++;

                if (UrlString.hashContainsKnownProperties(href)) {
                    // Success case
                    const contentHash = contentWindow.location.hash;
                    this.removeHiddenIframe(iframe);
                    clearInterval(intervalId);
                    resolve(contentHash);
                    return;
                } else if (ticks > maxTicks) {
                    // Timeout error
                    this.removeHiddenIframe(iframe);
                    clearInterval(intervalId);
                    reject(BrowserAuthError.createMonitorWindowTimeoutError(urlNavigate));
                    return;
                }
            }, BrowserConstants.POLL_INTERVAL_MS);
        });
    }

    /**
     * @hidden
     * Loads iframe with authorization endpoint URL
     * @ignore
     */
    private loadFrame(urlNavigate: string, frameName: string): Promise<HTMLIFrameElement> {
        /*
         * This trick overcomes iframe navigation in IE
         * IE does not load the page consistently in iframe
         */

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const frameHandle = this.loadFrameSync(urlNavigate, frameName);

                if (!frameHandle) {
                    reject(`Unable to load iframe with name: ${frameName}`);
                    return;
                }

                resolve(frameHandle);
            }, this.loadFrameTimeout);
        });
    }

    /**
     * @hidden
     * Loads the iframe synchronously when the navigateTimeFrame is set to `0`
     * @param urlNavigate
     * @param frameName
     * @param logger
     */
    private loadFrameSync(urlNavigate: string, frameName: string): HTMLIFrameElement{
        const frameHandle = this.getHiddenIframe(frameName);

        // returning to handle null in loadFrame, also to avoid null object access errors
        if (!frameHandle) {
            return null;
        }
        else if (frameHandle.src === "" || frameHandle.src === "about:blank") {
            frameHandle.src = urlNavigate;
        }

        return frameHandle;
    }

    /**
     * @hidden
     * Creates a new hidden iframe or gets an existing one for silent token renewal.
     * @ignore
     */
    private getHiddenIframe(iframeId: string): HTMLIFrameElement {
        if (typeof iframeId === "undefined") {
            return null;
        }

        let authFrame = document.getElementById(iframeId) as HTMLIFrameElement;
        if (!authFrame) {
            if (document.createElement &&
            document.documentElement &&
            (window.navigator.userAgent.indexOf("MSIE 5.0") === -1)) {
                const ifr = document.createElement("iframe");
                ifr.setAttribute("id", iframeId);
                ifr.style.visibility = "hidden";
                ifr.style.position = "absolute";
                ifr.style.width = ifr.style.height = "0";
                ifr.style.border = "0";
                ifr.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");
                authFrame = (document.getElementsByTagName("body")[0].appendChild(ifr) as HTMLIFrameElement);
            } else if (document.body && document.body.insertAdjacentHTML) {
                document.body.insertAdjacentHTML("beforeend", "<iframe name='" + iframeId + "' id='" + iframeId + "' style='display:none'></iframe>");
            }

            if (window.frames && window.frames[iframeId]) {
                authFrame = window.frames[iframeId];
            }
        }

        return authFrame;
    }

    /**
     * @hidden
     * Removes a hidden iframe from the page.
     * @ignore
     */
    private removeHiddenIframe(iframe: HTMLIFrameElement): void {
        if (document.body === iframe.parentNode) {
            document.body.removeChild(iframe);
        }
    }
}
