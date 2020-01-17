var didAuth = require('@decentralized-identity/did-auth-jose');

function microsoft() {
    
    this.init = init

    function init() {
        console.log('Microsoft Init!')
        createDID();
    }

    // This will give the output to put a DID onto the bitcoin testnet blockchain
    async function createDID() {

        //Generate a key pair
        const kid = '#key-1';
        const jwkPriv = await didAuth.EcPrivateKey.generatePrivateKey(kid);
        const jwkPub = jwkPriv.getPublicKey();
        jwkPub.defaultSignAlgorithm = 'ES256K';

        //fs.writeFileSync('./private.jwk', JSON.stringify(privKey));
        //fs.writeFileSync('./public.jwk', JSON.stringify(pubKey));'

        const privateKey = didAuth.EcPrivateKey.wrapJwk(jwkPriv.kid, jwkPriv);
        const body = {
            "@context": "https://w3id.org/did/v1",
            publicKey: [
                {
                    id: jwkPub.kid,
                    type: "Secp256k1VerificationKey2018",
                    publicKeyJwk: jwkPub
                }
            ],
            service: [
                {
                    id: "IdentityHub",
                    type: "IdentityHub",
                    serviceEndpoint: {
                        "@context": "schema.identity.foundation/hub",
                        "@type": "UserServiceEndpoint",
                        instance: [
                            "did:test:hub.id",
                        ]
                    }
                }
            ],
        };
    
        // Construct the JWS header
        const header = {
            alg: jwkPub.defaultSignAlgorithm,
            kid: jwkPub.kid,
            operation:'create',
            proofOfWork:'{}'
        };
    
        // Sign the JWS
        const cryptoFactory = new didAuth.CryptoFactory([new didAuth.Secp256k1CryptoSuite()]);
        const jwsToken = new didAuth.JwsToken(body, cryptoFactory);
        const signedBody = await jwsToken.signAsFlattenedJson(privateKey, {header});
    
        // Print out the resulting JWS to the console in JSON format
        console.log(JSON.stringify(signedBody));

        console.log("\n\n Microsoft DID created. You can use this output to registar with microsoft ion-test network");

        // 1. curl with JWS Payload to register to microsoft ion-test (bitcon testnet)
        // curl -v -H "Content-Type: application/json" --data '{"header":{"alg":"ES256K","kid":"#key-1","operation":"create","proofOfWork":"{}"},"payload":"eyJAY29udGV4dCI6Imh0dHBzOi8vdzNpZC5vcmcvZGlkL3YxIiwicHVibGljS2V5IjpbeyJpZCI6IiNrZXktMSIsInR5cGUiOiJTZWNwMjU2azFWZXJpZmljYXRpb25LZXkyMDE4IiwicHVibGljS2V5SndrIjp7Imt0eSI6IkVDIiwia2lkIjoiI2tleS0xIiwiY3J2IjoiUC0yNTZLIiwieCI6InRjeVRqM01SR3RQNWx5QjhRbzNCbmFabTRHUU9Ub0ZJRXNWU3Vsdy1pQzAiLCJ5IjoieHZkZWtuSGhlaXVuWjBPLTl1a244N3NGRkNhbDhkOENoeVk3TEVaNzdHQSIsInVzZSI6InZlcmlmeSIsImRlZmF1bHRFbmNyeXB0aW9uQWxnb3JpdGhtIjoibm9uZSIsImRlZmF1bHRTaWduQWxnb3JpdGhtIjoiRVMyNTZLIn19XSwic2VydmljZSI6W3siaWQiOiJJZGVudGl0eUh1YiIsInR5cGUiOiJJZGVudGl0eUh1YiIsInNlcnZpY2VFbmRwb2ludCI6eyJAY29udGV4dCI6InNjaGVtYS5pZGVudGl0eS5mb3VuZGF0aW9uL2h1YiIsIkB0eXBlIjoiVXNlclNlcnZpY2VFbmRwb2ludCIsImluc3RhbmNlIjpbImRpZDp0ZXN0Omh1Yi5pZCJdfX1dfQ","signature":"MEUCIQD-SH-P_bXed9A-ScIRG-CidXnJjCuI6A-cBXJv8nUVyQIgIH0rltuPdRHKH9IY0e4zsoibDEFc6wFhACpst6I9zDU"}' -X POST https://beta.ion.microsoft.com/api/1.0/register

        // 2. do curl request or GET in browser after some time to see 
        //curl https://beta.discover.did.microsoft.com/1.0/identifiers/did:ion-test:EiDDNR0RyVI4rtKFeI8GpaSougQ36mr1ZJb8u6vTZOW6Vw

        // 3. Output from 
        // {"document":{"@context":"https://w3id.org/did/v1","publicKey":[{"id":"#key-1","type":"Secp256k1VerificationKey2018","publicKeyJwk":{"kty":"EC","kid":"#key-1","crv":"P-256K","x":"tcyTj3MRGtP5lyB8Qo3BnaZm4GQOToFIEsVSulw-iC0","y":"xvdeknHheiunZ0O-9ukn87sFFCal8d8ChyY7LEZ77GA","use":"verify","defaultEncryptionAlgorithm":"none","defaultSignAlgorithm":"ES256K"}}],"service":[{"id":"IdentityHub","type":"IdentityHub","serviceEndpoint":{"@context":"schema.identity.foundation/hub","@type":"UserServiceEndpoint","instance":["did:test:hub.id"]}}],"id":"did:ion:test:EiBFE2wHFQZiFCggFu1Gv_-DOL3QRNCaBEqOH8avxu98Mw"},"resolverMetadata":{"driverId":"did:ion:test","driver":"HttpDriver","retrieved":"2020-01-17T20:32:18.268Z","duration":"141.0661ms"}}

    }

}

module.exports = new microsoft();