const EthrDID = require('ethr-did');
const Web3 = require('web3');
const createVerifiableCredential = require('did-jwt-vc').createVerifiableCredential;
const createPresentation = require('did-jwt-vc').createPresentation;
const Resolver = require('did-resolver').Resolver
const getResolver = require('ethr-did-resolver').getResolver
const verifyCredential = require('did-jwt-vc').verifyCredential
const verifyPresentation = require('did-jwt-vc').verifyPresentation
// const DidRegistryContract = require('ethr-did-registry')

const web3 = new Web3();

function uport() {
    
    this.init = init
    this.createNewDIDWithKeys = createNewDIDWithKeys

    function init() {
        console.log('UPort Init!')
        createAndVerify();
    }
    
    function createNewDIDWithKeys() {
        const account = web3.eth.accounts.create();
        const privKeyWithoutHeader = account.privateKey.substring(2);
        const ethrDid = new EthrDID({address: account.address, privateKey: privKeyWithoutHeader})
        const agentDid = {address:account.address, privateKey: privKeyWithoutHeader, did: ethrDid}
        return agentDid;
    }

    function createNewDID() {
        const account = web3.eth.accounts.create();
        const privKeyWithoutHeader = account.privateKey.substring(2);
        const ethrDid = new EthrDID({address: account.address, privateKey: privKeyWithoutHeader})
        return ethrDid;
    }

    async function createAndVerify() {

        const issuerDID = createNewDID();
        const bachelorDegreeDID = createNewDID();
        const issueTime = 1562950282;
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


    // function createIssuer() {
    //     const issuer = new EthrDID({
    //         address: '0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198',
    //         privateKey: 'd8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75'
    //     });
    //     return issuer;
    // }

    // async function registerDid() {
    //     // var web3 = new Web3();
    //     let networkId = 1 // Mainnet
    //     let DidReg = web3.eth.contract(DidRegistryContract.abi)
    //     let didReg = DidReg.at(DidRegistryContract.networks[networkId].address)
    //     console.log(didReg)
    // }
}

module.exports = new uport();