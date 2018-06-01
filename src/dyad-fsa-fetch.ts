import * as Dyad from 'dyad'
import {isFSA} from 'flux-standard-action'

const store = Dyad.getInstance()

export function middleware(action: any, next: Dyad.Dispatch): any {
  if (isFSA(action)) {
    const {type, meta: {fetch: decode = '', ...meta} = {}, payload} = action

    if (decode) {
      if (!payload) {
        throw new Error(`Action '${type}' missing fetch \`payload\` object`)
      }

      const {url, ...options}: any = payload

      if (!url) {
        throw new Error(`Action '${type}' missing fetch \`payload.url\` property`)
      }

      const promise = fetch(url, options).then((response) => {
        const {ok, status, statusText} = response

        if (!ok) {
          return response.text().then((body: string) => {
            throw new Error(`${status}${statusText ? `: ${statusText}` : ''}\n${body.trim()}\n`)
          })
        }

        const nextPayload = {
          body: response.body,
          bodyUsed: response.bodyUsed,
          headers: response.headers,
          ok,
          redirected: response.redirected,
          status,
          statusText,
          type: response.type,
          url: response.url
        }

        if (decode === 'raw') {
          // `{fetch: 'raw'}` -- Return a `ReadableStream` of the response body.
          return nextPayload
        }

        // `{fetch: 'arrayBuffer'}`, `{fetch: 'blob'}`, `{fetch: 'formData'}`,
        // `{fetch: 'json'}`, `{fetch: 'text'}`, ... -- Return a promise that
        // resolves to the result of parsing the response body.
        return (response as any)[decode]().then((value: any) => {
          (nextPayload as any).value = value
          return nextPayload
        })
      })

      return store.dispatch({type, meta, payload: promise})
    }
  }

  return next(action)
}
