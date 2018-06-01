# Dyad FSA Fetch Middleware

## Installation

```
npm install dyad-fsa-fetch
```

## Usage

```js
require('isomorphic-fetch')
const Dyad = require('dyad')
const {middleware: dyadFsaFetch} = require('./dyad-fsa-fetch')
const {middleware: dyadFsaPromise} = require('dyad-fsa-promise')

const store = Dyad.getInstance()

store.use(dyadFsaFetch)
store.use(dyadFsaPromise)

store.bind({
  ACTION_TYPE: (_, __, action) => console.log(action.payload.value[0].guid)
})

// `dyad-fsa-fetch` will look for an `action.meta.fetch` property, intercept
// matching actions, call `fetch()` with `action.payload.url` plus any other
// optional properties, then dispatch a new action with the `fetch()` promise
// as a new `payload`.
store.dispatch({
  type: 'ACTION_TYPE',
  meta: {
    // `action.meta.fetch` determines which method will be used to decode the
    // response body and store the result as `action.payload.value`. You can
    // use any decoder method name your Fetch API supports (for example:
    // 'arrayBuffer', 'blob', 'formData', 'json', 'text') or 'raw' to forgo
    // decoding and leave `action.payload.value` undefined.
    fetch: 'json'
  },
  payload: {
    // Required property `url` and other optional properties will be used to
    // call `fetch()` so you can specify request initializer options like
    // `method: 'PUT'`, `headers: {'content-type': 'application/json'}`,
    // `body: '{"a": 1, "b": true, "c": "u"}'`, and so on.
    url: 'https://next.json-generator.com/api/json/get/4ylLYeUkB'
  }
})

// Logs '4d87721e-e7ba-418a-ba54-e666e645489e'
```
