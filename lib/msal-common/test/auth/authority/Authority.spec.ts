import { expect } from "chai";
import { Authority } from "../../../src/auth/authority/Authority";
import { INetworkModule, NetworkRequestOptions } from "../../../src/network/INetworkModule";
import { Constants } from "../../../src/utils/Constants";
import { AuthorityType } from "../../../src/auth/authority/AuthorityType";
import { DEFAULT_TENANT_DISCOVERY_RESPONSE, TEST_URIS, RANDOM_TEST_GUID, TEST_TENANT_DISCOVERY_RESPONSE, DEFAULT_OPENID_CONFIG_RESPONSE } from "../../utils/StringConstants";
import { ClientConfigurationErrorMessage } from "../../../src/error/ClientConfigurationError";
import sinon from "sinon";
import { ClientAuthErrorMessage } from "../../../src";

class TestAuthority extends Authority {
    public get authorityType(): AuthorityType {
        return null;
    }    
    
    public async getOpenIdConfigurationEndpointAsync(): Promise<string> {
        return DEFAULT_TENANT_DISCOVERY_RESPONSE.tenant_discovery_endpoint;
    }
};

describe("Authority.ts Class Unit Tests", () => {

    describe("Constructor", () => {

        it("Creates canonical authority uri based on given uri (and normalizes with '/')", () => {
            const networkInterface: INetworkModule = {
                sendGetRequestAsync<T>(url: string, options?: NetworkRequestOptions): T {
                    return null;
                },
                sendPostRequestAsync<T>(url: string, options?: NetworkRequestOptions): T {
                    return null;
                }
            };
            const authority = new TestAuthority(Constants.DEFAULT_AUTHORITY, networkInterface);
            expect(authority.canonicalAuthority).to.be.eq(`${Constants.DEFAULT_AUTHORITY}/`);
        });

        it("Throws error if URI is not in valid format", () => {
            const networkInterface: INetworkModule = {
                sendGetRequestAsync<T>(url: string, options?: NetworkRequestOptions): T {
                    return null;
                },
                sendPostRequestAsync<T>(url: string, options?: NetworkRequestOptions): T {
                    return null;
                }
            };

            expect(() => new TestAuthority(`http://login.microsoftonline.com/common`, networkInterface)).to.throw(ClientConfigurationErrorMessage.authorityUriInsecure.desc);
            expect(() => new TestAuthority(`https://login.microsoftonline.com/`, networkInterface)).to.throw(ClientConfigurationErrorMessage.urlParseError.desc);
            expect(() => new TestAuthority("This is not a URI", networkInterface)).to.throw(ClientConfigurationErrorMessage.urlParseError.desc);
            expect(() => new TestAuthority("", networkInterface)).to.throw(ClientConfigurationErrorMessage.urlEmptyError.desc);
        });
    });

    describe("Getters and setters", () => {
        const networkInterface: INetworkModule = {
            sendGetRequestAsync<T>(url: string, options?: NetworkRequestOptions): T {
                return null;
            },
            sendPostRequestAsync<T>(url: string, options?: NetworkRequestOptions): T {
                return null;
            }
        };
        let authority: TestAuthority;
        beforeEach(() => {
            authority = new TestAuthority(Constants.DEFAULT_AUTHORITY, networkInterface);
        });
        
        it("Gets canonical authority that ends in '/'", () => {
            expect(authority.canonicalAuthority.endsWith("/")).to.be.true;
            expect(authority.canonicalAuthority).to.be.eq(`${Constants.DEFAULT_AUTHORITY}/`);
        });

        it("Set canonical authority performs validation and canonicalization on url", () => {
            expect(() => authority.canonicalAuthority = `http://login.microsoftonline.com/common`).to.throw(ClientConfigurationErrorMessage.authorityUriInsecure.desc);
            expect(() => authority.canonicalAuthority = `https://login.microsoftonline.com/`).to.throw(ClientConfigurationErrorMessage.urlParseError.desc);
            expect(() => authority.canonicalAuthority = "This is not a URI").to.throw(ClientConfigurationErrorMessage.urlParseError.desc);
            
            authority.canonicalAuthority = `${TEST_URIS.ALTERNATE_INSTANCE}/${RANDOM_TEST_GUID}`
            expect(authority.canonicalAuthority.endsWith("/")).to.be.true;
            expect(authority.canonicalAuthority).to.be.eq(`${TEST_URIS.ALTERNATE_INSTANCE}/${RANDOM_TEST_GUID}/`);
        });

        it("Get canonicalAuthorityUrlComponents returns current url components", () => {
            expect(authority.canonicalAuthorityUrlComponents.Protocol).to.be.eq("https:")
            expect(authority.canonicalAuthorityUrlComponents.HostNameAndPort).to.be.eq("login.microsoftonline.com");
            expect(authority.canonicalAuthorityUrlComponents.PathSegments).to.be.deep.eq(["common"]);
            expect(authority.canonicalAuthorityUrlComponents.AbsolutePath).to.be.eq("/common/");
            expect(authority.canonicalAuthorityUrlComponents.Hash).to.be.undefined;
            expect(authority.canonicalAuthorityUrlComponents.Search).to.be.undefined;
        });

        it("tenant is equal to first path segment value", () => {
            expect(authority.tenant).to.be.eq("common");
            expect(authority.tenant).to.be.eq(authority.canonicalAuthorityUrlComponents.PathSegments[0]);
        });

        describe("OAuth Endpoints", () => {

            beforeEach(async () => {
                sinon.stub(TestAuthority.prototype, <any>"discoverEndpoints").resolves(DEFAULT_OPENID_CONFIG_RESPONSE);
                await authority.resolveEndpointsAsync();
            });

            afterEach(() => {
                sinon.restore();
            });
            
            it ("Returns authorization_endpoint of tenantDiscoveryResponse", () => {
                expect(authority.authorizationEndpoint).to.be.eq(DEFAULT_OPENID_CONFIG_RESPONSE.authorization_endpoint.replace("{tenant}", "common"));
            });

            it ("Returns token_endpoint of tenantDiscoveryResponse", () => {
                expect(authority.tokenEndpoint).to.be.eq(DEFAULT_OPENID_CONFIG_RESPONSE.token_endpoint.replace("{tenant}", "common"));
            });

            it ("Returns end_session_endpoint of tenantDiscoveryResponse", () => {
                expect(authority.endSessionEndpoint).to.be.eq(DEFAULT_OPENID_CONFIG_RESPONSE.end_session_endpoint.replace("{tenant}", "common"));
            });

            it ("Returns issuer of tenantDiscoveryResponse for selfSignedJwtAudience", () => {
                expect(authority.selfSignedJwtAudience).to.be.eq(DEFAULT_OPENID_CONFIG_RESPONSE.issuer.replace("{tenant}", "common"));
            });

            it("Throws error if endpoint discovery is incomplete for authorizationEndpoint, tokenEndpoint, endSessionEndpoint and selfSignedJwtAudience", () => {
                authority = new TestAuthority(Constants.DEFAULT_AUTHORITY, networkInterface);
                expect(() => authority.authorizationEndpoint).to.throw(ClientAuthErrorMessage.endpointResolutionError.desc);
                expect(() => authority.tokenEndpoint).to.throw(ClientAuthErrorMessage.endpointResolutionError.desc);
                expect(() => authority.endSessionEndpoint).to.throw(ClientAuthErrorMessage.endpointResolutionError.desc);
                expect(() => authority.selfSignedJwtAudience).to.throw(ClientAuthErrorMessage.endpointResolutionError.desc);
            });
        });
    });

    describe("Endpoint discovery", () => {

        const networkInterface: INetworkModule = {
            sendGetRequestAsync<T>(url: string, options?: NetworkRequestOptions): T {
                return null;
            },
            sendPostRequestAsync<T>(url: string, options?: NetworkRequestOptions): T {
                return null;
            }
        };
        let authority: TestAuthority;
        beforeEach(() => {
            authority = new TestAuthority(Constants.DEFAULT_AUTHORITY, networkInterface);
        });
        
        it("discoveryComplete returns false if endpoint discovery has not been completed", () => {
            expect(authority.discoveryComplete()).to.be.false;
        });

        it("discoveryComplete returns true if resolveEndpointsAsync resolves successfully", async () => {
            sinon.stub(TestAuthority.prototype, <any>"discoverEndpoints").resolves(DEFAULT_OPENID_CONFIG_RESPONSE);
            await authority.resolveEndpointsAsync();
            expect(authority.discoveryComplete()).to.be.true;
            sinon.restore();
        }); 

        it("resolveEndpoints returns the openIdConfigurationEndpoint and then obtains the tenant discovery response from that endpoint", async () => {
            networkInterface.sendGetRequestAsync = (url: string, options?: NetworkRequestOptions): any => {
                return DEFAULT_OPENID_CONFIG_RESPONSE;
            };
            authority = new TestAuthority(Constants.DEFAULT_AUTHORITY, networkInterface);
            await authority.resolveEndpointsAsync();

            expect(authority.discoveryComplete()).to.be.true;
            expect(authority.authorizationEndpoint).to.be.eq(DEFAULT_OPENID_CONFIG_RESPONSE.authorization_endpoint.replace("{tenant}", "common"));
            expect(authority.tokenEndpoint).to.be.eq(DEFAULT_OPENID_CONFIG_RESPONSE.token_endpoint.replace("{tenant}", "common"));
            expect(authority.endSessionEndpoint).to.be.eq(DEFAULT_OPENID_CONFIG_RESPONSE.end_session_endpoint.replace("{tenant}", "common"));
            expect(authority.selfSignedJwtAudience).to.be.eq(DEFAULT_OPENID_CONFIG_RESPONSE.issuer.replace("{tenant}", "common"));
       });
    });
});
