const Agent = require('openssi-websdk').Agent;

const account_url = process.env.ACCOUNT_URL;
const agent_name = process.env.AGENT_NAME;
const agent_password = process.env.AGENT_PASSWORD;

const name = "My Schema";
const version = "0.0.1";
const attributes = [
    'first_name',
    'last_name',
    'photo_id_hash'
];

function ibm() {
    
    this.init = init

    function init() {
        console.log('IBM Init!')
        ibmWorkflow();
    }

    async function ibmWorkflow() {
        console.log('Create new agent with account url: ' + account_url)
        const agent = new Agent(account_url, agent_name, agent_password);
        console.log(agent)

        const agentInfo = await agent.getIdentity();
        console.log(`Agent info: ${JSON.stringify(agentInfo, 0, 1)}`)


        // Create schema
        const cred_schema = await agent.createCredentialSchema(name, version, attributes);

        console.log('\n\n cred schema \n\n')
        console.log(cred_schema)
        
        // Publish Schema to blockchain
        const cred_def = await agent.createCredentialDefinition(cred_schema.id);


    }
}

module.exports = new ibm();