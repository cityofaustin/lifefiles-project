/*
AGENT SPECIFIC BUSINESS LOGIC
*/

var
  agent_dal=require('./agent_dal'),
  common = require("../../common"),
  uport = require('../../services/uport')
  ;

var microdb = require('microdb-api')(process.env.MICRODB_APIKEY);

exports.getByAccountId = getByAccountId;
exports.SaveProfile = SaveProfile;
exports.GetAll = GetAll;
exports.getVerifiablePayload = getVerifiablePayload;

function getByAccountId(id) {
  return agent_dal.getByAccountId(id);
}

function SaveProfile(data) {
  return agent_dal.SaveProfile(data);
}


function GetAll() {
  return agent_dal.GetAll();
}

function getVerifiablePayload(data) {
  return new Promise(function (resolve) {
    computeVerifiablePayload(data, resolve);
  });
}

async function computeVerifiablePayload(data, resolve) {
  let res = await microdb.Tables.agent.get({ 'accountid': data.AccountInfo.accountid })
  let user = res.data && res.data.Rows ? res.data.Rows : [];
  let address = '';

  if(user[0].didaddress === null || user[0].did === "") {
    let did = uport.createNewDIDWithKeys();
    let newData = { name: data.AccountInfo, primarykey: data.AccountInfo.primarykey, didaddress: did.address, didprivatekey: did.privateKey }
    await microdb.Tables.agent.saveUpdate(newData);
    address = did.address
  } else {
    address = user[0].didaddress
  }

  var response = new common.response();
  response.success = true;
  response.did = 'did:ethr:' + address;
  response.message = 'success'
  resolve(response)
}
