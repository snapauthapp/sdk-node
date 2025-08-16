# SnapAuth SDK for NodeJS

The official NodeJS SDK for SnapAuth 🫰

This is for _server_ code.
If you're looking for the _client_ integration, check out `@snapauth/sdk`.

[![NPM Version](https://img.shields.io/npm/v/%40snapauth%2Fnode-sdk)](https://www.npmjs.com/package/@snapauth/node-sdk)
![npm bundle size](https://img.shields.io/bundlephobia/min/%40snapauth%2Fnode-sdk)
![GitHub License](https://img.shields.io/github/license/snapauthapp/sdk-node)

- [SnapAuth Homepage](https://www.snapauth.app)
- [Docs](https://docs.snapauth.app)
- [Dashboard](https://dashboard.snapauth.app)
- [Github](https://github.com/snapauthapp/sdk-node)

## Installation and Setup

```bash
npm i --save @snapauth/node-sdk
# yarn add @snapauth/sdk
# etc
```

```typescript
import SnapAuth from '@snapauth/node-sdk'
const snapAuth = new SnapAuth(process.env.SNAPAUTH_SECRET_KEY)
```
> [!TIP]
> The SDK will auto-detect a `SNAPAUTH_SECRET_KEY` environment variable.
> If that's where you've set up your Secret Key, you can simplify this to
> `const snapAuth = new SnapAuth()`.


## Usage

All examples are in TypeScript, based roughly on an ExpressJS app.

General usage is as follows:

```typescript
const response = await snapAuth.someApiCall(param1, ...)
if (response.ok) {
  // Got back a 2xx
  // console.assert(response.result !== null)
  useDataFrom(response.result)
} else {
  // Any other response, or network error
  // console.assert(response.result === null)
  // console.assert(response.errors.length > 0)
  console.error(response.errors)
}
```

This is similar to `fetch()` which you're probably already familiar with.

If the API call succeeded, the [response](https://docs.snapauth.app/server.html) will be in `response.result`.

> [!NOTE]
> Even on successful responses, `response.errors` may contain information, such as deprecation or usage warnings.
> We suggest always examining this value.

### Completing credential registration

```typescript
app.post('/register', async (request, response) => {
  // You should have POSTed something like this:
  // {
  //  token: string
  //  username: string
  // }
  const token = request.body.token
  const username = request.body.username
  // Do whatever you normally do to create a new User record
  const user = createUserWithUsername(username)
  // Then save the new passkey
  const credentialInfo = await snapAuth.attachRegistration(token, {
    id: user.id, // You may need to cast this to a string first, e.g. `String(user.id)`
    username: user.username, // Probably the value from above
  })
  // That's it. Proceed as normal.
})
```

> [!NOTE]
> The `id` is what you should use during authentication; it can not be changed.
> The `username` is to make client code more straightforward, and is typically the value the user would type in to a username field.
>
> `username` MAY be omitted.
> We automatically perform a one-way hash before storing it in order to preserve user privacy, so it will not be returned to you later.

### Authenticating

```typescript
app.post('/signin', async (request, response) => {
  // { token: string }
  const token = request.body.token
  const auth = await snapAuth.verifyAuthToken(token)
  if (auth.ok) {
    signInUserWithId(auth.result.user.id)
  } else {
    // Look at auth.errors and decide what, if anything, to display to the user.
  }
})
```

## Building the SDK

Run `npm run watch` to keep the build running continually on file change.

To make the local version available for linking, run `npm link` in this directory.

In the project that should _use_ the local version, run `npm link '@snapauth/node-sdk'` which will set up the symlinking.
