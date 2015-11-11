# Auth0 API Authorization - User Consent

Create **Organizer** as a `Resource Server`:

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

Create **CalendarApp** as a `Client`:

```
curl -XPOST 'https://AUTH0_DOMAIN/api/v2/clients' -H "Authorization: Bearer AUTH0_API2_TOKEN" -H "Content-Type: application/json" -d '{
  "name": "Calendar App",
  "resource_servers": [
    { "identifier": "urn:organizer-api", "scopes": [ "appointments", "contacts" ] }
  ],
  "callbacks": [ "http://localhost:7002" ]
}'
```

Then copy the `client_id` and `client_secret` from the response and save it in the `config.json` file.
