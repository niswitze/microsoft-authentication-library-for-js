import { expect } from "chai";
import sinon from "sinon";
import { BrowserUtils } from "../../src/utils/BrowserUtils"
import { TEST_URIS } from "./StringConstants";
import { XhrClient } from "../../src/network/XhrClient";
import { FetchClient } from "../../src/network/FetchClient";

describe("BrowserUtils.ts Function Unit Tests", () => {

    let oldWindow: Window & typeof globalThis;
    afterEach(() => {
        sinon.restore();
        oldWindow = window;
        window.fetch = undefined;
    });

    afterEach(() => {
        window = oldWindow;
    });

    it("navigateWindow() with noHistory false or not set will call location.assign", (done) => {
        const oldWindowLocation = window.location;
        delete window.location;
        window.location = {
            ...oldWindowLocation,
            assign: function (url) {
                try {
                    expect(url).to.include(TEST_URIS.TEST_LOGOUT_URI);
                    done();
                } catch (e) {
                    console.error(e);
                }
            }
        };
        const windowAssignSpy = sinon.spy(window.location, "assign");
        BrowserUtils.navigateWindow(TEST_URIS.TEST_LOGOUT_URI);
        expect(windowAssignSpy.calledOnce).to.be.true;
    });

    it("navigateWindow() with noHistory true will call location.replace", (done) => {
        const oldWindowLocation = window.location;
        delete window.location;
        window.location = {
            ...oldWindowLocation,
            replace: function (url) {
                try {
                    expect(url).to.include(TEST_URIS.TEST_REDIR_URI);
                    done();
                } catch (e) {
                    console.error(e);
                }
            }
        };
        const windowReplaceSpy = sinon.spy(window.location, "replace");
        BrowserUtils.navigateWindow(TEST_URIS.TEST_REDIR_URI, true);
        expect(windowReplaceSpy.calledOnce).to.be.true;
    });

    it("clearHash() clears the window hash", () => {
        window.location.hash = "thisIsAHash";
        BrowserUtils.clearHash()
        expect(window.location.hash).to.be.empty;
    });
    
    it("isInIframe() returns false if window parent is not the same as the current window", () => {
        expect(BrowserUtils.isInIframe()).to.be.false;
        sinon.stub(window, "parent").value(null);
        expect(BrowserUtils.isInIframe()).to.be.true;
    });

    it("getCurrentUri() returns current location uri of browser", () => {
        expect(BrowserUtils.getCurrentUri()).to.be.eq(TEST_URIS.TEST_REDIR_URI);
    });

    it("getBrowserNetworkClient() returns fetch client if available", () => {
        window.fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
            return null;
        };
        expect(BrowserUtils.getBrowserNetworkClient() instanceof FetchClient).to.be.true;
    });

    it("getBrowserNetworkClient() returns xhr client if available", () => {
        expect(BrowserUtils.getBrowserNetworkClient() instanceof XhrClient).to.be.true;
    });
});
