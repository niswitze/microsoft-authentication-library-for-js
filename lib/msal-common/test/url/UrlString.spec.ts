import { expect } from "chai";
import { TEST_URIS, TEST_HASHES } from "../utils/StringConstants";
import { UrlString } from "../../src/url/UrlString";
import { ClientConfigurationError, ClientConfigurationErrorMessage } from "../../src/error/ClientConfigurationError";
import { IUri } from "../../src/url/IUri";
import sinon from "sinon";

describe("UrlString.ts Class Unit Tests", () => {

    afterEach(() => {
        sinon.restore();
    });
    
    it("Creates a valid UrlString object", () => {
        let urlObj = new UrlString(TEST_URIS.TEST_REDIR_URI.toUpperCase());
        expect(urlObj.urlString).to.be.eq(TEST_URIS.TEST_REDIR_URI + "/");
    });

    it("constructor throws error if uri is empty or null", () => {
        expect(() => new UrlString(null)).to.throw(ClientConfigurationErrorMessage.urlEmptyError.desc);
        expect(() => new UrlString(null)).to.throw(ClientConfigurationError);

        expect(() => new UrlString("")).to.throw(ClientConfigurationErrorMessage.urlEmptyError.desc);
        expect(() => new UrlString("")).to.throw(ClientConfigurationError);
    });

    it("validateAsUri throws error if uri components could not be extracted", () => {
        const urlComponentError = "Error getting url components"
        sinon.stub(UrlString.prototype, "getUrlComponents").throws(urlComponentError);
        let urlObj = new UrlString(TEST_URIS.TEST_REDIR_URI);
        expect(() => urlObj.validateAsUri()).to.throw(`${ClientConfigurationErrorMessage.urlParseError.desc} Given Error: ${urlComponentError}`);
        expect(() => urlObj.validateAsUri()).to.throw(ClientConfigurationError);
    });

    it("validateAsUri throws error if uri is not secure", () => {
        const insecureUrlString = "http://login.microsoft.com/common";
        let urlObj = new UrlString(insecureUrlString);
        expect(() => urlObj.validateAsUri()).to.throw(`${ClientConfigurationErrorMessage.authorityUriInsecure.desc} Given URI: ${insecureUrlString}`);
        expect(() => urlObj.validateAsUri()).to.throw(ClientConfigurationError);
    });

    it("validateAsUri throws error if uri is not valid", () => {
        const shortPathUrlString = "https://login.microsoft.com";
        let urlObj = new UrlString(shortPathUrlString);
        expect(() => urlObj.validateAsUri()).to.throw(`${ClientConfigurationErrorMessage.urlParseError.desc} Given Error: Given url string: ${shortPathUrlString}/`);
        expect(() => urlObj.validateAsUri()).to.throw(ClientConfigurationError);
    });

    it("urlRemoveQueryStringParameter removes required path components",() => {
        let urlObj1 = new UrlString(TEST_URIS.TEST_AUTH_ENDPT_WITH_PARAMS1);
        expect(urlObj1.urlString).to.contain("param1=value1");
        urlObj1.urlRemoveQueryStringParameter("param1");
        expect(urlObj1.urlString).to.not.contain("param1=value1");

        let urlObj2 = new UrlString(TEST_URIS.TEST_AUTH_ENDPT_WITH_PARAMS2);
        expect(urlObj2.urlString).to.contain("param1=value1");
        expect(urlObj2.urlString).to.contain("param2=value2");
        urlObj2.urlRemoveQueryStringParameter("param2");
        expect(urlObj2.urlString).to.contain("param1=value1");
        expect(urlObj2.urlString).to.not.contain("param2=value2");
        urlObj2.urlRemoveQueryStringParameter("param1");
        expect(urlObj2.urlString).to.not.contain("param1=value1");
        expect(urlObj2.urlString).to.not.contain("param2=value2");
    });

    it("replaceTenantPath correctly replaces common with tenant id", () => {
        let urlObj = new UrlString(TEST_URIS.TEST_AUTH_ENDPT);
        const sampleTenantId = "sample-tenant-id";
        expect(urlObj.urlString).to.contain("common");
        expect(urlObj.urlString).to.not.contain(sampleTenantId);
        const newUrlObj = urlObj.replaceTenantPath(sampleTenantId);
        expect(newUrlObj.urlString).to.not.contain("common");
        expect(newUrlObj.urlString).to.contain(sampleTenantId);
    });

    it("replaceTenantPath correctly replaces organizations with tenant id", () => {
        let urlObj = new UrlString(TEST_URIS.TEST_AUTH_ENDPT_ORGS);
        const sampleTenantId = "sample-tenant-id";
        expect(urlObj.urlString).to.contain("organizations");
        expect(urlObj.urlString).to.not.contain(sampleTenantId);
        const newUrlObj = urlObj.replaceTenantPath(sampleTenantId);
        expect(newUrlObj.urlString).to.not.contain("organizations");
        expect(newUrlObj.urlString).to.contain(sampleTenantId);
    });

    it("replaceTenantPath returns the same url if path does not contain common or organizations", () => {
        let urlObj = new UrlString(TEST_URIS.TEST_AUTH_ENDPT_TENANT_ID);
        const sampleTenantId2 = "sample-tenant-id-2";
        expect(urlObj.urlString).to.contain("sample-tenantid");
        expect(urlObj.urlString).to.not.contain(sampleTenantId2);
        const newUrlObj = urlObj.replaceTenantPath(sampleTenantId2);
        expect(newUrlObj.urlString).to.contain("sample-tenantid");
        expect(newUrlObj.urlString).to.not.contain(sampleTenantId2);
    });

    it("getHash returns the anchor part of the URL correctly, or nothing if there is no anchor", () => {
        const urlWithHash = TEST_URIS.TEST_AUTH_ENDPT + TEST_HASHES.TEST_SUCCESS_ID_TOKEN_HASH;
        const urlWithHashAndSlash = TEST_URIS.TEST_AUTH_ENDPT + "#/" + TEST_HASHES.TEST_SUCCESS_ID_TOKEN_HASH.substring(1);
        const urlWithoutHash = TEST_URIS.TEST_AUTH_ENDPT;
        
        const urlObjWithHash = new UrlString(urlWithHash);
        const urlObjWithHashAndSlash = new UrlString(urlWithHashAndSlash);
        const urlObjWithoutHash = new UrlString(urlWithoutHash);

        expect(urlObjWithHash.getHash()).to.be.eq(TEST_HASHES.TEST_SUCCESS_ID_TOKEN_HASH.substring(1));
        expect(urlObjWithHashAndSlash.getHash()).to.be.eq(TEST_HASHES.TEST_SUCCESS_ID_TOKEN_HASH.substring(1));
        expect(urlObjWithoutHash.getHash()).to.be.empty;
    });

    it("getDeserializedHash returns the hash as a deserialized object", () => {
        const serializedHash = "#param1=value1&param2=value2&param3=value3";
        const deserializedHash = {
            "param1": "value1",
            "param2": "value2",
            "param3": "value3",
        };
        const urlWithHash = TEST_URIS.TEST_AUTH_ENDPT + serializedHash;
        const urlObjWithHash = new UrlString(urlWithHash);

        expect(urlObjWithHash.getDeserializedHash()).to.be.deep.eq(deserializedHash);
    });

    it("getUrlComponents returns all path components", () => {
        const urlObj = new UrlString(TEST_URIS.TEST_AUTH_ENDPT_WITH_PARAMS1);
        expect(urlObj.getUrlComponents()).to.be.deep.eq({
            Protocol: "https:",
            HostNameAndPort: "login.microsoftonline.com",
            AbsolutePath: "/common/oauth2/v2.0/authorize",
            PathSegments: ["common", "oauth2", "v2.0", "authorize"]
        } as IUri);
    });

    it("constructAuthorityUriFromObject creates a new UrlString object", () => {
        const urlComponents = {
            Protocol: "https:",
            HostNameAndPort: "login.microsoftonline.com",
            AbsolutePath: "/common/oauth2/v2.0/authorize",
            PathSegments: ["common", "oauth2", "v2.0", "authorize"]
        } as IUri;
        const urlObj = UrlString.constructAuthorityUriFromObject(urlComponents);
        expect(urlObj.urlString).to.be.eq(TEST_URIS.TEST_AUTH_ENDPT + "/");
    });

    it("hashContainsKnownProperties returns true if correct hash is given", () => {
        expect(UrlString.hashContainsKnownProperties(TEST_HASHES.TEST_SUCCESS_ID_TOKEN_HASH)).to.be.true;
        expect(UrlString.hashContainsKnownProperties(TEST_HASHES.TEST_SUCCESS_ACCESS_TOKEN_HASH)).to.be.true;
        expect(UrlString.hashContainsKnownProperties(TEST_HASHES.TEST_SUCCESS_CODE_HASH)).to.be.true;
        expect(UrlString.hashContainsKnownProperties(TEST_HASHES.TEST_ERROR_HASH)).to.be.true;
    });

    it("hashContainsKnownProperties returns false if incorrect hash is given", () => {
        const exampleUnknownHash = "#param1=value1&param2=value2&param3=value3";
        expect(UrlString.hashContainsKnownProperties(exampleUnknownHash)).to.be.false;
    });
});
