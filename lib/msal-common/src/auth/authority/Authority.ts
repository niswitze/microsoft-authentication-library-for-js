/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AuthorityType } from "./AuthorityType";
import { TenantDiscoveryResponse } from "./TenantDiscoveryResponse";
import { UrlString } from "../../url/UrlString";
import { IUri } from "../../url/IUri";
import { ClientAuthError } from "../../error/ClientAuthError";
import { INetworkModule } from "../../network/INetworkModule";

/**
 * The authority class validates the authority URIs used by the user, and retrieves the OpenID Configuration Data from the
 * endpoint. It will store the pertinent config data in this object for use during token calls.
 */
export abstract class Authority {

    // Canonical authority url string
    private _canonicalAuthority: UrlString;
    // Canonicaly authority url components
    private _canonicalAuthorityUrlComponents: IUri;
    // Tenant discovery response retrieved from OpenID Configuration Endpoint
    private tenantDiscoveryResponse: TenantDiscoveryResponse;
    // Network interface to make requests with.
    protected networkInterface: INetworkModule;

    // See above for AuthorityType
    public abstract get authorityType(): AuthorityType;

    /**
     * A URL that is the authority set by the developer
     */
    public get canonicalAuthority(): string {
        return this._canonicalAuthority.urlString;
    }

    /**
     * Sets canonical authority.
     */
    public set canonicalAuthority(url: string) {
        this._canonicalAuthority = new UrlString(url);
        this._canonicalAuthority.validateAsUri();
        this._canonicalAuthorityUrlComponents = null;
    }

    /**
     * Get authority components.
     */
    public get canonicalAuthorityUrlComponents(): IUri {
        if (!this._canonicalAuthorityUrlComponents) {
            this._canonicalAuthorityUrlComponents = this._canonicalAuthority.getUrlComponents();
        }

        return this._canonicalAuthorityUrlComponents;
    }

    /**
     * Get tenant for authority.
     */
    public get tenant(): string {
        return this.canonicalAuthorityUrlComponents.PathSegments[0];
    }

    /**
     * OAuth /authorize endpoint for requests
     */
    public get authorizationEndpoint(): string {
        if(this.discoveryComplete()) {
            return this.replaceTenant(this.tenantDiscoveryResponse.authorization_endpoint);
        } else {
            throw ClientAuthError.createEndpointDiscoveryIncompleteError("Discovery incomplete.");
        }
    }

    /**
     * OAuth /token endpoint for requests
     */
    public get tokenEndpoint(): string {
        if(this.discoveryComplete()) {
            return this.replaceTenant(this.tenantDiscoveryResponse.token_endpoint);
        } else {
            throw ClientAuthError.createEndpointDiscoveryIncompleteError("Discovery incomplete.");
        }
    }

    /**
     * OAuth logout endpoint for requests
     */
    public get endSessionEndpoint(): string {
        if(this.discoveryComplete()) {
            return this.replaceTenant(this.tenantDiscoveryResponse.end_session_endpoint);
        } else {
            throw ClientAuthError.createEndpointDiscoveryIncompleteError("Discovery incomplete.");
        }
    }

    /**
     * OAuth issuer for requests
     */
    public get selfSignedJwtAudience(): string {
        if(this.discoveryComplete()) {
            return this.replaceTenant(this.tenantDiscoveryResponse.issuer);
        } else {
            throw ClientAuthError.createEndpointDiscoveryIncompleteError("Discovery incomplete.");
        }
    }

    /**
     * Replaces tenant in url path with current tenant. Defaults to common.
     * @param urlString 
     */
    private replaceTenant(urlString: string): string {
        return urlString.replace("{tenant}", this.tenant);
    }

    /**
     * The default open id configuration endpoint for any canonical authority.
     */
    protected get defaultOpenIdConfigurationEndpoint(): string {
        return `${this.canonicalAuthority}v2.0/.well-known/openid-configuration`;
    }

    constructor(authority: string, networkInterface: INetworkModule) {
        this.canonicalAuthority = authority;

        this._canonicalAuthority.validateAsUri();
        this.networkInterface = networkInterface;
    }

    /**
     * Boolean that returns whethr or not tenant discovery has been completed.
     */
    discoveryComplete(): boolean {
        return !!this.tenantDiscoveryResponse;
    }

    /**
     * Gets OAuth endpoints from the given OpenID configuration endpoint.
     * @param openIdConfigurationEndpoint 
     */
    private async discoverEndpoints(openIdConfigurationEndpoint: string): Promise<TenantDiscoveryResponse> {
        return this.networkInterface.sendGetRequestAsync<TenantDiscoveryResponse>(openIdConfigurationEndpoint);
    }

    /**
     * Abstract function which will get the OpenID configuration endpoint.
     */
    public abstract async getOpenIdConfigurationEndpointAsync(): Promise<string>;

    /**
     * Perform endpoint discovery to discover the /authorize, /token and logout endpoints.
     */
    public async resolveEndpointsAsync(): Promise<void> {
        const openIdConfigEndpoint = await this.getOpenIdConfigurationEndpointAsync();
        this.tenantDiscoveryResponse = await this.discoverEndpoints(openIdConfigEndpoint);
    }
}
