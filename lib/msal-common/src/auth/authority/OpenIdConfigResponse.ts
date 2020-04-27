/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * The OpenID Configuration Endpoint Response interface. Used by the authority class to get relevant OAuth endpoints.
 */
export interface OpenIdConfigResponse {
    tenant_discovery_endpoint: string;
}
