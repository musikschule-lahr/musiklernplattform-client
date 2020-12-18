import Keycloak from 'keycloak-js';

// Setup Keycloak instance as needed
// Pass initialization options as required or leave blank to load from 'keycloak.json'
const keycloak = new Keycloak({
  realm: process.env.KEYCLOAK_REALM,
  url: process.env.KEYCLOAK_SERVER_URL,
  clientId: process.env.KEYCLOAK_CLIENT,
});

export default keycloak;
