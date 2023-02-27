# zbyte-sso-verify

This library gives a Keycloak class that helps to validate the token and retreive corresponding claims from it.

## Directory Structure

The package contains only one index.ts file which exports Keycloak object required for verification.

This object can be used in other typescript based code repositories as -

```
const keycloak = Keycloak({ realm: "KEYCLOAK_REALM", authServerUrl: "KEYCLOAK_AUTH_SERVER_URL" });

const user = await keycloak.verifyOffline(token);
```

## CI/CD

Package will be released on the merge to master branch. Any changes in the code for a new package release should be accompanied with a version change in package.json file.

## Installation

Before installing the lib user need to add .npmrc file in home directory which will contain the below details

```
@zbyteio:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken={FORCI}
```
You can install the library using npm package manager
```
npm install @zbyteio/zbyte-common@1.0.3
```
Install via package.json
```
"@zbyteio/zbyte-sso-verify": "1.0.3"
```
1.0.3 is the example version.