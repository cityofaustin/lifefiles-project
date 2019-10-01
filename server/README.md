Server
========================

Requires Node Js 

This application exposes a REST API to the client UI. On the server side it uses the MVC pattern. 
The client UI makes HTTP REST calls to server HTTP URLs as endpoints where Controllers attached to the URLs listen for incoming messages. The server application boots begins with the app.js file...see for notes.

Request/Reponse Flow
- app begins with app.js which attaches controllers
- if a request is for a file such as an html page that file is returned
- if a REST API request arrives at server it is routed to respective controller which does work then returns a response object.
- API Requests are JSON objects which contain data as need for a respective controller
- Responses are JSON objects that follow a common format see /common/response.js for the format. Using a common format provides consistent handling and makes for consistent expectations.
- All REST routing controllers use HTTP POST only for this application. It forces consistent code patterns and keeps things simple.



Adjust envVars.txt for settings per environment.

SERVER_PORT=9005
NODE_ENV=production
ENABLE_LOGGING=true
LOGFILENAME=app_log.log
API_HOST=api.microdb.co
API_PORT=443
MICRODB_MYPASS_DB_APIKEY=your_secret_api_key

> The envVars.txt is usually kept secure but as a reminder...
> The Microdb API key is a private key to be kept secure.
> MICRODB_MYPASS_DB_APIKEY=your_secret_api_key


Folders
- bll: The business logic layer
