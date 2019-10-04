/*
ACCOUNT SPECIFIC BUSINESS LOGIC
*/

var
  account_dal = require('./account_dal')
   ;


exports.getByEmail = getByEmail;
exports.createAccount = createAccount;
exports.getAccountById = getAccountById;
exports.SaveProfile = SaveProfile;
exports.DeleteAccount=DeleteAccount;

exports.resetPasswordComplete = resetPasswordComplete;
exports.UpdateLastLogin = UpdateLastLogin;
exports.LockAccount = LockAccount;
exports.UpdateBadAttempt = UpdateBadAttempt;
exports.ClearBadAttempt = ClearBadAttempt;
exports.getAccountBy_PasswordRestCode = getAccountBy_PasswordRestCode;

function getByEmail(email) {
  return account_dal.getByEmail(email);
}


function createAccount(user) {
  return account_dal.createAccount(user);
}

function getAccountById(id) {
  return account_dal.getAccountById(id);
}


function SaveProfile(data) {
  return account_dal.SaveProfile(data);
}

function DeleteAccount(data) {
  //FOR DEMO PURPOSES ONLY...WONT USE IN PRODUCTION
  return account_dal.DeleteAccount(data);
}



function resetPasswordComplete(data) {
  return account_dal.resetPasswordComplete(data);
}

function getAccountBy_PasswordRestCode(data) {
  return account_dal.getAccountBy_PasswordRestCode(data);
}

function UpdateLastLogin(accountId) {
  return account_dal.UpdateLastLogin(accountId);
}

function LockAccount(accountId) {
  return account_dal.LockAccount(accountId);
}

function UpdateBadAttempt(accountId) {
  return account_dal.UpdateBadAttempt(accountId);
}

function ClearBadAttempt(accountId) {
  return account_dal.ClearBadAttempt(accountId);
}
