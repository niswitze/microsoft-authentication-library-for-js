/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ModuleConfiguration, buildModuleConfiguration } from "./ModuleConfiguration";

/**
 * @type AuthOptions: Use this to configure the auth options in the Configuration object
 *
 *  - clientId                    - Client ID of your app registered with our Application registration portal : https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredAppsPreview in Microsoft Identity Platform
 *  - authority                   - You can configure a specific authority, defaults to " " or "https://login.microsoftonline.com/common"
 *  - redirectUri                 - The redirect URI of the application, this should be same as the value in the application registration portal.Defaults to `window.location.href`.
 *  - postLogoutRedirectUri       - Used to redirect the user to this location after logout. Defaults to `window.location.href`.
 */
export type AuthOptions = {
    clientId: string;
    authority?: string;
    redirectUri?: string | (() => string);
    postLogoutRedirectUri?: string | (() => string);
};

/**
 * Use the configuration object to configure MSAL and initialize the AuthorizationCodeModule.
 *
 * This object allows you to configure important elements of MSAL functionality:
 * - auth: this is where you configure auth elements like clientID, authority used for authenticating against the Microsoft Identity Platform
 */
export type PublicClientSPAConfiguration = ModuleConfiguration & {
    auth: AuthOptions
};

const DEFAULT_AUTH_OPTIONS: AuthOptions = {
    clientId: "",
    authority: null,
    redirectUri: "",
    postLogoutRedirectUri: ""
};

/**
 * Function that sets the default options when not explicitly configured from app developer
 *
 * @param TAuthOptions
 * @param TStorageOptions
 * @param TSystemOptions
 * @param TFrameworkOptions
 *
 * @returns TConfiguration object
 */
export function buildPublicClientSPAConfiguration({ auth, loggerOptions, storageInterface, networkInterface, cryptoInterface }: PublicClientSPAConfiguration): PublicClientSPAConfiguration {
    const baseConfig = buildModuleConfiguration({loggerOptions, storageInterface, networkInterface, cryptoInterface});
    const overlayedConfig: PublicClientSPAConfiguration = {
        auth: { ...DEFAULT_AUTH_OPTIONS, ...auth },
        ...baseConfig
    };
    return overlayedConfig;
}
