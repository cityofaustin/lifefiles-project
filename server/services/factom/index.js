const Factom = require('factom-harmony-connect');
const uuidv4 = require('uuid/v4');

const factomIntegrateSDK = new Factom({
  baseUrl: "https://ephemeral.api.factom.com/v1",
  accessToken: {
    appId: process.env.FACTOM_APP_ID,
    appKey: process.env.FACTOM_APP_KEY
  },
});

function factom() {
    
    this.init = init
   
    function init() {
        console.log('factom Init!')
        factomWorkflow();
    }

    async function factomWorkflow() {
        const now = Date.now();
        const info = await factomIntegrateSDK.apiInfo.get(); 
        console.log(info);

        // Owner Registration
        const names = ["" + now,"" + (now + 10000)]

        const userIdentity = await factomIntegrateSDK.identities.create({
            names:names
        });
        console.log("User Identity")
        console.log(userIdentity)

        const userDid = "did:factom" + userIdentity.chain_id;
        const entryHash = userIdentity.entry_hash;
        const userChainId = userIdentity.chain_id;


        // Goverment Key Registration
        const masterKey = factomIntegrateSDK.utils.generateKeyPair();

        var govKeys = [
            masterKey,
            factomIntegrateSDK.utils.generateKeyPair(),
            factomIntegrateSDK.utils.generateKeyPair()
        ]

        const govIdentity = await factomIntegrateSDK.identities.create({
            names: ["USGOV" + now, "TEXAS" + now, "DMV"+ now],
            keys: [
                govKeys[0].publicKey,
                govKeys[1].publicKey,
                govKeys[2].publicKey
            ]
        })
        console.log("Gov Itentity")
        console.log(govIdentity)

        const govDid = "did:factom:" + govIdentity.chain_id;
        const govChainId = govIdentity.chain_id;

        // Create Claims
        var licenseClaim = factomIntegrateSDK.claim.create({
            "id": userDid,
            "class": "KR",
            "state": "CA",
            "restrictions": "None"
        });
        var addressClaim = factomIntegrateSDK.claim.create({
            "id": userDid,
            "address": "2457 Ybarra Rd Nores, California, 93666"
        });
        var dobClaim = factomIntegrateSDK.claim.create({
            "id": userDid,
            "dob": "1952-07-17T00:00:00-0800"
        });
        var appearanceClaim = factomIntegrateSDK.claim.create({
            "id": userDid,
            "height": "6'4\"",
            "sex": "Male",
            "eyes": "Brown"
        });

        console.log("Claims Created")

        // Sign Claims
        var signedLicense = licenseClaim.sign({
            signer: govDid + "#key-2",
            signerPrivateKey: govKeys[2].privateKey
        })
        var signedAddress = addressClaim.sign({
            signer: govDid + "#key-2",
            signerPrivateKey: govKeys[2].privateKey
        })
        var signedDob = dobClaim.sign({
            signer: govDid + "#key-2",
            signerPrivateKey: govKeys[2].privateKey
        })
        var signedAppearance = appearanceClaim.sign({
            signer: govDid + "#key-2",
            signerPrivateKey: govKeys[2].privateKey
        })

        console.log("Claims Signed")

        // Register Claims to Blockchain
        await signedLicense.register({
            destinationChainId: userChainId,
            signerPrivateKey: govKeys[2].privateKey,
            signerChainId: govChainId
        });

        await signedAddress.register({
            destinationChainId: userChainId,
            signerPrivateKey: govKeys[2].privateKey,
            signerChainId: govChainId
        })

        await signedDob.register({
            destinationChainId: userChainId,
            signerPrivateKey: govKeys[2].privateKey,
            signerChainId: govChainId
        })

        await signedAppearance.register({
            destinationChainId: userChainId,
            signerPrivateKey: govKeys[2].privateKey,
            signerChainId: govChainId
        })

        console.log("Claims Registered to Blockchain")

        // Create VC
        var licenseClaims = [ signedLicense, signedAddress, signedDob, signedAppearance];
        var licenseCredential = factomIntegrateSDK.credential.create({
            issuer: "did:factom:" + govChainId,
            credentialSubject: licenseClaims,
            issuanceDate: "2008-02-17T07:47:46.0000Z",
            expirationDate: "2028-02-17T07:47:46.0000Z"
        });

        console.log("VC Created")
        console.log(licenseCredential)

        // Sign VC
        var signedCredential = licenseCredential.sign({
            signer: govDid + "#key-2",
            signerPrivateKey: govKeys[2].privateKey
        });

        console.log("VC Signed")
        console.log(signedCredential)

        // Register Credential to Blockchain
        await signedCredential.register({
            destinationChainId: "3607d...4cb6e",
            signerPrivateKey: govKeys[2].privateKey,
            signerChainId: govChainId
        })

        console.log("Credentials Registered to Blockchain")

        // Export the credential
        const jsonCredentialData = signedCredential.export();
        // Import the credential
        const importedCredential = factomIntegrateSDK.credential.import(jsonCredentialData);


        // Create Presentation
        const licensePresentation = factomIntegrateSDK.presentation.create({
            verifiableCredential: importedCredential
        })

        const signedPresentation = await licensePresentation.sign({
            signer: govDid + "#key-2",
            signerPrivateKey: govKeys[2].privateKey
        })

        console.log("Presentation Signed Registered to Blockchain")
        console.log(signedPresentation)


        const presentationWithProof = await signedPresentation.addProof();

        console.log("Presentation With Proof!")
        console.log(presentationWithProof)

        console.log("\n\nFactom Workflow Finished\n")
    }
}


module.exports = new factom();