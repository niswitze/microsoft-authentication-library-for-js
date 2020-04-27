# Token Lifetimes, Expiration, and Renewal

Before you start here, make sure you understand how to [login](./login-user.md) and [acquire tokens](./acquire-token.md).

While using MSAL.js, you should understand the implications of retrieving tokens for users and how to manage the lifetimes for these tokens.

## Token Lifetimes and Expiration

A more detailed explanation of token lifetimes can be found [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-configurable-token-lifetimes). Some of the information is summarized below.

### ID tokens

ID tokens are bound to a specific combination of account and client, and usually contain profile information about the user. Typically, a web application's user session lifetime will match that of the ID token session lifetime, which is by default 24 hours. You can read more about configuring token lifetimes [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-configurable-token-lifetimes).

### Access tokens

Access tokens in the browser have a default recommended expiration of 1 hour. After this 1 hour, any bearer calls with the expired token will be rejected. This token can be refreshed silently using the refresh token retrieved with this token. You can read more about configuring token lifetimes [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-configurable-token-lifetimes).

### Refresh tokens

Refresh tokens given to Single-Page Applications are limited-time refresh tokens (usually 24 hours from the time of retrieval). This is a non-adjustable lifetime. Whenever a refresh token is used to renew an access token, a new refresh token is fetched with the renewed access token. Once a refresh token has expired, a new authorization code flow must be initiated to retrieve an authorization code and trade it for a new set of tokens. (TODO: Add docs for RT here)

## Token Renewal

The `PublicClientApplication` object exposes an API called `acquireTokenSilent` which is meant to retrieve non-expired token silently. It does this in a few steps:

1. Check if a token already exists in the token cache for the given `scopes`, `client id`, `authority`, and/or `homeAccountIdentifier`.
2. If a token exists for the given parameters, then ensure we get a single match and check the expiration.
3. If the access token is not expired, MSAL will return a response with the given tokens.
4. If the access token is expired but the refresh token is still valid, MSAL will use the given refresh token to retrieve a new set of tokens, and then return a response.
5. If the refresh token is expired, MSAL will pass on an error from the server as a `ServerError`, asking to retrieve an authorization code to retrieve a new set of tokens. You can do this by performing a login or acquireToken API call with the `PublicClientApplication` object. If the session is still active, the server will send a code without any user prompts. Otherwise, the user will be required to enter their credentials.

### Code Snippets

- Popup
```javascript
var request = {
    scopes: ["Mail.Read"]
};

const tokenResponse = await msalInstance.acquireTokenSilent(request).catch(async (error) => {
    // fallback to interaction when silent call fails
    return await myMSALObj.acquireTokenPopup(request).catch(error => {
        console.log(error);
    });
});
```

- Redirect
```javascript
var request = {
    scopes: ["Mail.Read"]
};

const tokenResponse = await msalInstance.acquireTokenSilent(request).catch(error => {
    console.log("silent token acquisition fails. acquiring token using redirect");
    // fallback to interaction when silent call fails
    return myMSALObj.acquireTokenRedirect(request)
});
```

# Next Steps

Learn how to perform [log out](./logout.md).
