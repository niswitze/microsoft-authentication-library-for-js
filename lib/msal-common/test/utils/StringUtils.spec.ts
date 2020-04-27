import { expect } from "chai";
import { StringUtils } from "../../src/utils/StringUtils";
import { TEST_TOKENS } from "./StringConstants";
import { ClientAuthError, ClientAuthErrorMessage } from "../../src/error/ClientAuthError";
import { AuthError } from "../../src/error/AuthError";

describe("StringUtils.ts Class Unit Tests", () => {
    
    it("decodeJwt returns a correctly crackedToken.", () => {
        const sampleJwt = `${TEST_TOKENS.SAMPLE_JWT_HEADER}.${TEST_TOKENS.SAMPLE_JWT_PAYLOAD}.${TEST_TOKENS.SAMPLE_JWT_SIG}`;
        const decodedJwt = StringUtils.decodeJwt(sampleJwt);

        expect(decodedJwt).to.be.deep.eq({
            header: TEST_TOKENS.SAMPLE_JWT_HEADER,
            JWSPayload: TEST_TOKENS.SAMPLE_JWT_PAYLOAD,
            JWSSig: TEST_TOKENS.SAMPLE_JWT_SIG
        });
    });

    it("decodeJwt throws error when given a null token string", () => {
        let err: ClientAuthError;

        try {
            let decodedJwt = StringUtils.decodeJwt(null);
        } catch (e) {
            err = e;
        }

        expect(err instanceof ClientAuthError).to.be.true;
        expect(err instanceof AuthError).to.be.true;
        expect(err instanceof Error).to.be.true;
        expect(err.errorCode).to.equal(ClientAuthErrorMessage.nullOrEmptyIdToken.code);
        expect(err.errorMessage).to.include(ClientAuthErrorMessage.nullOrEmptyIdToken.desc);
        expect(err.message).to.include(ClientAuthErrorMessage.nullOrEmptyIdToken.desc);
        expect(err.name).to.equal("ClientAuthError");
        expect(err.stack).to.include("StringUtils.spec.ts");
    });

    it("decodeJwt throws error when given a empty token string", () => {
        let err: ClientAuthError;

        try {
            let decodedJwt = StringUtils.decodeJwt("");
        } catch (e) {
            err = e;
        }

        expect(err instanceof ClientAuthError).to.be.true;
        expect(err instanceof AuthError).to.be.true;
        expect(err instanceof Error).to.be.true;
        expect(err.errorCode).to.equal(ClientAuthErrorMessage.nullOrEmptyIdToken.code);
        expect(err.errorMessage).to.include(ClientAuthErrorMessage.nullOrEmptyIdToken.desc);
        expect(err.message).to.include(ClientAuthErrorMessage.nullOrEmptyIdToken.desc);
        expect(err.name).to.equal("ClientAuthError");
        expect(err.stack).to.include("StringUtils.spec.ts");
    });

    it("decodeJwt throws error when given a malformed token string", () => {
        let err: ClientAuthError;

        try {
            let decodedJwt = StringUtils.decodeJwt(TEST_TOKENS.SAMPLE_MALFORMED_JWT);
        } catch (e) {
            err = e;
        }

        expect(err instanceof ClientAuthError).to.be.true;
        expect(err instanceof AuthError).to.be.true;
        expect(err instanceof Error).to.be.true;
        expect(err.errorCode).to.equal(ClientAuthErrorMessage.idTokenParsingError.code);
        expect(err.errorMessage).to.include(ClientAuthErrorMessage.idTokenParsingError.desc);
        expect(err.message).to.include(ClientAuthErrorMessage.idTokenParsingError.desc);
        expect(err.name).to.equal("ClientAuthError");
        expect(err.stack).to.include("StringUtils.spec.ts");
    });

    it("isEmpty correctly identifies empty strings", () => {
        expect(StringUtils.isEmpty(undefined)).to.be.true;
        expect(StringUtils.isEmpty(null)).to.be.true;
        expect(StringUtils.isEmpty("")).to.be.true;
        expect(StringUtils.isEmpty("Non-empty string")).to.be.false;
    });


    it("queryStringToObject correctly deserializes query string into object", () => {
        const serializedObj = "param1=value1&param2=value2&param3=value3";
        const deserializedObj = {
            "param1": "value1",
            "param2": "value2",
            "param3": "value3",
        };
        expect(StringUtils.queryStringToObject(serializedObj)).to.be.deep.eq(deserializedObj);        
    });

    it("trimAndConvertArrayEntriesToLowerCase() converts entries to lower case and trims them", () => {

    });

    it("removeEmptyStringsFromArray() removes empty strings from an array", () => {

    });
});
