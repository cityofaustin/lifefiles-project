var EthrDID = require('ethr-did');
var Web3 = require('web3');
var createVerifiableCredential = require('did-jwt-vc').createVerifiableCredential;
var createPresentation = require('did-jwt-vc').createPresentation;
var Resolver = require('did-resolver').Resolver
var getResolver = require('ethr-did-resolver').getResolver
var verifyCredential = require('did-jwt-vc').verifyCredential
var verifyPresentation = require('did-jwt-vc').verifyPresentation

function uport() {
    
    this.init = init

    function init() {
        console.log('UPort Init')
        createAndVerify();
    }

    function createNewDID() {
        var web3 = new Web3();
        var account = web3.eth.accounts.create();
        let privKeyWithoutHeader = account.privateKey.substring(2);
        const ethrDid = new EthrDID({address: account.address, privateKey: privKeyWithoutHeader})
        return ethrDid;
    }

    // function createIssuer() {
    //     const issuer = new EthrDID({
    //         address: '0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198',
    //         privateKey: 'd8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75'
    //     });
    //     return issuer;
    // }

    async function createAndVerify() {

        let issuerDID = createNewDID();
        let bachelorDegreeDID = createNewDID();
        let issueTime = 1562950282;

        // const issuer = createIssuer();
        const resolver = new Resolver(getResolver())
        
        const vcJwt = await createVC(issuerDID, bachelorDegreeDID, issueTime);
        console.log('\n\nVerifiable Credential Created!\n')
        console.log(vcJwt)

        const vpJwt = await creatingVerifiablePresentation(issuerDID, vcJwt);
        console.log('\n\nVerifiable Presentation Created!\n')
        console.log(vpJwt)

        const verifiedVC = await verifyVC(vcJwt, resolver);
        console.log('\n\nVerifiable Credential Has Been Verified!\n')
        console.log(verifiedVC)

        const verifiedPR = await verifyVP(vpJwt, resolver)
        console.log('\n\nVerifiable Presentation Has Been Verified!\n')
        console.log(verifiedPR)

        console.log('\n\nUPort Create And Verify Workflow Finished\n\n')

    }

    async function createVC(issuer, bachelorDegreeDID, issueTime) {
        const vcPayload = {
            sub: bachelorDegreeDID.did,
            nbf: issueTime,
            vc: {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                type: ['VerifiableCredential'],
                credentialSubject: {
                    degree: {
                        type: 'BachelorDegree',
                        name: 'Baccalauréat en musiques numériques'
                    }
                }
            }
        }

        const vcJwt = await createVerifiableCredential(vcPayload, issuer)
        return vcJwt;
    }

    async function creatingVerifiablePresentation(issuer, vcJwt) {
        const vpPayload = {
            vp: {
              '@context': ['https://www.w3.org/2018/credentials/v1'],
              type: ['VerifiableCredential'],
              verifiableCredential: [vcJwt]
            }
          }
          
          const vpJwt = await createPresentation(vpPayload, issuer)
          return vpJwt;
    }

    async function verifyVC(vcJwt, resolver) {
        const verifiedVC = await verifyCredential(vcJwt, resolver)
        return verifiedVC;
    }

    async function verifyVP(vpJwt, resolver) {
        const verifiedVP = await verifyPresentation(vpJwt, resolver)
        return verifiedVP;
    }
}

module.exports = new uport();