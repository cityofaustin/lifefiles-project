Controllers
========================

Public Controllers that do not require authentication token check
- /home
- /auth 

Secure Controllers that require authentication token check
- /api

Secure Controllers use method passportConf.isAuthenticated in their invocations.
passportConf.isAuthenticated checks that the user is logged in and has authentication cookie be allowing the API call to be invoked.

Controllers pass data into bll objects and send bll output data back to calling client code.
