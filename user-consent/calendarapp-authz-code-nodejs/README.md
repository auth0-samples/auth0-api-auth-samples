# Client: CalendarApp (Node.js - Authorization Code Grant)

Demo: https://api-authz-calendar-authorization-code.azurewebsites.net/

## Configuration

Before running this sample you must first make sure your Resource Server is running and you also need to define the Client in Auth0:

```
curl -XPOST 'https://AUTH0_DOMAIN/api/v2/clients' -H "Authorization: Bearer AUTH0_API2_TOKEN" -H "Content-Type: application/json" -d '{
  "name": "Calendar App - Authorization Code",
  "resource_servers": [
    { "identifier": "urn:organizer-api", "scopes": [ "appointments", "contacts" ] }
  ],
  "callbacks": [ "http://localhost:7003/auth/organizer/callback" ]
}'
```

Capture the result from this call, especially the `client_id` and `client_secret` (you will need to enter this in the `config.json` file).

More information is available [here](https://auth0.com/docs/api-authn-authz#tutorials).

## Running the sample

 1. Update the `config.json` file with your own settings
 2. Run `npm install`
 3. Run `node server`
 4. The web application will start http://localhost:7002
 5. Sign in and try to get your data from the Resource Server
