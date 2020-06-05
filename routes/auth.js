// const path = require('path') // has path and __dirname
const common = require("../common/common");
const express = require('express');
const oauthServer = require('../oath');
const DebugControl = require('../utilities/debug');

const router = express.Router(); // Instantiate a new router

// const filePath = path.join(__dirname, '../public/oauthAuthenticate.html')

router.get('/', (req,res) => {  // send back a simple form for the oauth
    return res.json({ account: 'todo' });
})

router.post('/authorize', async (req,res,next) => {
  DebugControl.log.flow('Initial User Authentication');
  const {username, password} = req.body;
  const accountMatched = await common.dbClient.getAccountByCredentials(username, password);
  if (accountMatched) {
    req.body.user = accountMatched;
    return next();
  }
  const params = [ // Send params back down
    'client_id', // client
    'redirect_uri', // client.redirect
     // tried 'code'
     // token is not supported for some reason https://github.com/oauthjs/node-oauth2-server/blob/master/lib/handlers/authorize-handler.js#L32
    'response_type',
    'grant_type', // authorization_code
    'state', // could be used to prevent CSRF https://www.npmjs.com/package/csurf
    'scope', // is a comma separated permissions string like 'public,birthday,email'
  ]
    .map(a => `${a}=${req.body[a]}`)
    .join('&');
    // This should redirect back to the login page, not here since we aren't logging in over here.
  return res.redirect(`/oauth?success=false&${params}`);
}, (req,res, next) => { // sends us to our redirect with an authorization code in our url
  DebugControl.log.flow('Authorization');
  return next();
}, oauthServer.authorize({
  authenticateHandler: {
    handle: req => {
      DebugControl.log.functionName('Authenticate Handler');
      DebugControl.log.parameters(Object.keys(req.body).map(k => ({name: k, value: req.body[k]})));
      return req.body.user;
    }
  },
  allowEmptyState: true,
  authorizationCodeLifetime: 600 // 10min, default 5 minutes
}));

router.post('/token', (req,res,next) => {
  DebugControl.log.flow('Token')
  next()
}, oauthServer.token({
  requireClientAuthentication: { // whether client needs to provide client_secret
    'authorization_code': false,
    accessTokenLifetime: 3600, // 1hr, default 1 hour
    refreshTokenLifetime: 1209600 // 2wk, default 2 weeks
  },
}));  // Sends back token

module.exports = router