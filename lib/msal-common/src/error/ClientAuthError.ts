/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AuthError } from "./AuthError";
import { IdToken } from "../auth/IdToken";
import { ScopeSet } from "../auth/ScopeSet";

/**
 * ClientAuthErrorMessage class containing string constants used by error codes and messages.
 */
export const ClientAuthErrorMessage = {
    clientInfoDecodingError: {
        code: "client_info_decoding_error",
        desc: "The client info could not be parsed/decoded correctly. Please review the trace to determine the root cause."
    },
    clientInfoEmptyError: {
        code: "client_info_empty_error",
        desc: "The client info was empty. Please review the trace to determine the root cause."
    },
    idTokenParsingError: {
        code: "id_token_parsing_error",
        desc: "ID token cannot be parsed. Please review stack trace to determine root cause."
    },
    nullOrEmptyIdToken: {
        code: "null_or_empty_id_token",
        desc: "The idToken is null or empty. Please review the trace to determine the root cause."
    },
    tokenRequestCacheError: {
        code: "token_request_cache_error",
        desc: "The token request could not be fetched from the cache correctly."
    },
    endpointResolutionError: {
        code: "endpoints_resolution_error",
        desc: "Error: could not resolve endpoints. Please check network and try again."
    },
    invalidAuthorityType: {
        code: "invalid_authority_type",
        desc: "The given authority is not a valid type of authority supported by MSAL. Please review the trace to determine the root cause."
    },
    hashNotDeserialized: {
        code: "hash_not_deserialized",
        desc: "The hash parameters could not be deserialized. Please review the trace to determine the root cause."
    },
    blankGuidGenerated: {
        code: "blank_guid_generated",
        desc: "The guid generated was blank. Please review the trace to determine the root cause."
    },
    stateMismatchError: {
        code: "state_mismatch",
        desc: "State mismatch error. Please check your network. Continued requests may cause cache overflow."
    },
    nonceMismatchError: {
        code: "nonce_mismatch",
        desc: "Nonce mismatch error. This may be caused by a race condition in concurrent requests."
    },
    accountMismatchError: {
        code: "account_mismatch",
        desc: "The cached account and account which made the token request do not match."
    },
    invalidIdToken: {
        code: "invalid_id_token",
        desc: "Invalid ID token format."
    },
    noTokensFoundError: {
        code: "no_tokens_found",
        desc: "No tokens were found for the given scopes, and no authorization code was passed to acquireToken. You must retrieve an authorization code before making a call to acquireToken()."
    },
    cacheParseError: {
        code: "cache_parse_error",
        desc: "Could not parse cache key."
    },
    userLoginRequiredError: {
        code: "user_login_error",
        desc: "User login is required."
    },
    multipleMatchingTokens: {
        code: "multiple_matching_tokens",
        desc: "The cache contains multiple tokens satisfying the requirements. " +
            "Call AcquireToken again providing more requirements such as authority, resource, or account."
    },
    tokenRequestCannotBeMade: {
        code: "request_cannot_be_made",
        desc: "Token request cannot be made without authorization code or refresh token."
    },
    appendEmptyScopeError: {
        code: "cannot_append_empty_scope",
        desc: "Cannot append null or empty scope to ScopeSet. Please check the stack trace for more info."
    },
    removeEmptyScopeError: {
        code: "cannot_remove_empty_scope",
        desc: "Cannot remove null or empty scope from ScopeSet. Please check the stack trace for more info."
    },
    appendScopeSetError: {
        code: "cannot_append_scopeset",
        desc: "Cannot append ScopeSet due to error."
    },
    emptyInputScopeSetError: {
        code: "empty_input_scopeset",
        desc: "Empty input ScopeSet cannot be processed."
    }
};

/**
 * Error thrown when there is an error in the client code running on the browser.
 */
export class ClientAuthError extends AuthError {
        
    constructor(errorCode: string, errorMessage?: string) {
        super(errorCode, errorMessage);
        this.name = "ClientAuthError";

        Object.setPrototypeOf(this, ClientAuthError.prototype);
    }

    /**
     * Creates an error thrown when client info object doesn't decode correctly.
     * @param caughtError 
     */
    static createClientInfoDecodingError(caughtError: string): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.clientInfoDecodingError.code,
            `${ClientAuthErrorMessage.clientInfoDecodingError.desc} Failed with error: ${caughtError}`);
    }

    /**
     * Creates an error thrown if the client info is empty.
     * @param rawClientInfo 
     */
    static createClientInfoEmptyError(rawClientInfo: string): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.clientInfoEmptyError.code,
            `${ClientAuthErrorMessage.clientInfoEmptyError.desc} Given Object: ${rawClientInfo}`);
    }

    /**
     * Creates an error thrown when the id token extraction errors out.
     * @param err 
     */
    static createIdTokenParsingError(caughtExtractionError: string): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.idTokenParsingError.code,
            `${ClientAuthErrorMessage.idTokenParsingError.desc} Failed with error: ${caughtExtractionError}`);
    }

    /**
     * Creates an error thrown when the id token string is null or empty.
     * @param invalidRawTokenString 
     */
    static createIdTokenNullOrEmptyError(invalidRawTokenString: string) : ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.nullOrEmptyIdToken.code,
            `${ClientAuthErrorMessage.nullOrEmptyIdToken.desc} Raw ID Token Value: ${invalidRawTokenString}`);
    }

    /**
     * Creates an error thrown when the token request could not be retrieved from the cache
     * @param errDetail 
     */
    static createTokenRequestCacheError(errDetail: string): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.tokenRequestCacheError.code, 
            `${ClientAuthErrorMessage.tokenRequestCacheError.desc} Error Detail: ${errDetail}`);
    }

    /**
     * Creates an error thrown when the endpoint discovery doesn't complete correctly.
     */
    static createEndpointDiscoveryIncompleteError(errDetail: string): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.endpointResolutionError.code, 
            `${ClientAuthErrorMessage.endpointResolutionError.desc} Detail: ${errDetail}`);
    }

    /**
     * Creates an error thrown if authority type is not valid.
     * @param invalidAuthorityError 
     */
    static createInvalidAuthorityTypeError(givenUrl: string): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.invalidAuthorityType.code, 
            `${ClientAuthErrorMessage.invalidAuthorityType.desc} Given Url: ${givenUrl}`);
    }

    /**
     * Creates an error thrown when the hash cannot be deserialized.
     * @param invalidAuthorityError 
     */
    static createHashNotDeserializedError(hashParamObj: string): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.hashNotDeserialized.code, 
            `${ClientAuthErrorMessage.hashNotDeserialized.desc} Given Object: ${hashParamObj}`);
    }

    /**
     * Creates an error thrown when two states do not match.
     */
    static createStateMismatchError(): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.stateMismatchError.code, 
            ClientAuthErrorMessage.stateMismatchError.desc);
    }

    /**
     * Creates an error thrown when the nonce does not match.
     */
    static createNonceMismatchError(): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.nonceMismatchError.code, 
            ClientAuthErrorMessage.nonceMismatchError.desc);
    }

    /** 
     * Creates an error thrown when the cached account and response account do not match.
     */
    static createAccountMismatchError(): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.accountMismatchError.code, 
            ClientAuthErrorMessage.accountMismatchError.desc);
    }

    /**
     * Throws error if idToken is not correctly formed
     * @param idToken 
     */
    static createInvalidIdTokenError(idToken: IdToken) : ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.invalidIdToken.code,
            `${ClientAuthErrorMessage.invalidIdToken.desc} Given token: ${JSON.stringify(idToken)}`);
    }

    /**
     * Creates an error thrown when the authorization code required for a token request is null or empty.
     */
    static createNoTokensFoundError(scopes: string): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.noTokensFoundError.code, 
            `${ClientAuthErrorMessage.noTokensFoundError.desc} Scopes: ${scopes}`);
    }

    /**
     * Creates an error in cache parsing.
     */
    static createCacheParseError(cacheKey: string): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.cacheParseError.code, 
            `${ClientAuthErrorMessage.cacheParseError.desc} Cache key: ${cacheKey}`);
    }

    /**
     * Throws error when renewing token without login.
     */
    static createUserLoginRequiredError() : ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.userLoginRequiredError.code,
            ClientAuthErrorMessage.userLoginRequiredError.desc);
    }

    /**
     * Throws error when multiple tokens are in cache for the given scope.
     * @param scope 
     */
    static createMultipleMatchingTokensInCacheError(scope: string): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.multipleMatchingTokens.code,
            `Cache error for scope ${scope}: ${ClientAuthErrorMessage.multipleMatchingTokens.desc}.`);
    }

    /**
     * Throws error when no auth code or refresh token is given to ServerTokenRequestParameters.
     */
    static createTokenRequestCannotBeMadeError(): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.tokenRequestCannotBeMade.code, ClientAuthErrorMessage.tokenRequestCannotBeMade.desc);
    }

    /**
     * Throws error when attempting to append a null, undefined or empty scope to a set
     * @param givenScope 
     */
    static createAppendEmptyScopeToSetError(givenScope: string): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.appendEmptyScopeError.code, `${ClientAuthErrorMessage.appendEmptyScopeError.desc} Given Scope: ${givenScope}`);
    }

    /**
     * Throws error when attempting to append a null, undefined or empty scope to a set
     * @param givenScope 
     */
    static createRemoveEmptyScopeFromSetError(givenScope: string): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.removeEmptyScopeError.code, `${ClientAuthErrorMessage.removeEmptyScopeError.desc} Given Scope: ${givenScope}`);
    }

    /**
     * Throws error when attempting to append null or empty ScopeSet.
     * @param appendError 
     */
    static createAppendScopeSetError(appendError: string): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.appendScopeSetError.code, `${ClientAuthErrorMessage.appendScopeSetError.desc} Detail Error: ${appendError}`);
    }

    /**
     * Throws error if ScopeSet is null or undefined.
     * @param givenScopeSet 
     */
    static createEmptyInputScopeSetError(givenScopeSet: ScopeSet): ClientAuthError {
        return new ClientAuthError(ClientAuthErrorMessage.emptyInputScopeSetError.code, `${ClientAuthErrorMessage.emptyInputScopeSetError.desc} Given ScopeSet: ${givenScopeSet}`);
    }
}
