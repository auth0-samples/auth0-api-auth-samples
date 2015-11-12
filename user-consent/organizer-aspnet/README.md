# Resource Server: Organizer (ASP.NET Web API)

## Configuration

Before running this sample you must first define the Resource Server in Auth0:

```
curl -XPOST 'https://AUTH0_DOMAIN/api/v2/resource-servers' -H "Authorization: Bearer AUTH0_API2_TOKEN" -H "Content-Type: application/json" -d '{
  "identifier": "urn:organizer-api",
  "scopes": [
      { "value": "contacts", "description": "Manage your contacts" },
      { "value": "appointments", "description": "Manage your appointments" },
      { "value": "tasks", "description": "Manage your tasks" }
  ]
}'
```

More information is available [here](https://auth0.com/docs/api-authn-authz#tutorials).

## Running the sample

 1. Update the `web.config` file with your own settings
 2. Start the project
 3. The API will be listening on http://localhost:7001
 4. Now use one of the clients to connect to the API
