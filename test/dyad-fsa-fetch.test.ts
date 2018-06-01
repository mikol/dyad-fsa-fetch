import 'isomorphic-fetch'

import {expect} from 'chai'
import * as Dyad from 'dyad'
import * as sinon from 'sinon'

import {middleware as dyadFsaFetch} from '../src/dyad-fsa-fetch'
import {middleware as dyadFsaPromise} from 'dyad-fsa-promise'

const g: any =
  typeof global !== 'undefined' && global ||
  typeof window !== 'undefined' && window

const store = Dyad.getInstance()

describe('dyad-fsa-fetch', () => {
  before(() => store.initialize())

  beforeEach(() => {
    sinon.stub(g, 'fetch')
    store.use(dyadFsaFetch)
    store.use(dyadFsaPromise)
  })

  afterEach(() => {
    g.fetch.restore()
    store.initialize()
  })

  it('can dispatch actions', () => {
    const expectedAction = {type: 'ACTION_TYPE'}

    return new Promise((resolve, reject) => {
      store.bind({
        ACTION_TYPE: (_, __, action: Dyad.Action) => {
          try {
            expect(action).to.equal(expectedAction)
            resolve()
          } catch (error) {
            reject(error)
          }
        }
      })

      store.dispatch(expectedAction)
    })
  })

  it('can fetch without reading value', () => {
    const dispatchedAction = {
      type: 'ACTION_TYPE',
      meta: {
        fetch: 'raw'
      },
      payload: {
        url: 'https://cicd.co/test'
      }
    }

    const response = new Response('Hello, World!', {
      status: 200,
      headers: {
        'content-type': 'text/plain'
      }
    })

    g.fetch.returns(Promise.resolve(response))

    return new Promise((resolve, reject) => {
      store.bind({
        ACTION_TYPE: (_, __, action: Dyad.Action) => {
          try {
            expect(action.payload.value).to.be.undefined
            resolve()
          } catch (error) {
            reject(error)
          }
        }
      })

      store.dispatch(dispatchedAction)
    })
  })

  it('can fetch text', () => {
    const dispatchedAction = {
      type: 'ACTION_TYPE',
      meta: {
        fetch: 'text'
      },
      payload: {
        url: 'https://cicd.co/test'
      }
    }

    const response = new Response('Hello, World!', {
      status: 200,
      headers: {
        'content-type': 'text/plain'
      }
    })

    const textSpy = sinon.spy(response, 'text')

    g.fetch.returns(Promise.resolve(response))

    return new Promise((resolve, reject) => {
      store.bind({
        ACTION_TYPE: (_, __, action: Dyad.Action) => {
          try {
            expect(textSpy.callCount).to.equal(1)
            expect(action.payload.value).to.equal('Hello, World!')
            resolve()
          } catch (error) {
            reject(error)
          }
        }
      })

      store.dispatch(dispatchedAction)
    })
  })

  it('can fetch JSON', () => {
    const dispatchedAction = {
      type: 'ACTION_TYPE',
      meta: {
        fetch: 'json'
      },
      payload: {
        url: 'https://cicd.co/test'
      }
    }

    const response = new Response('{"a": 1, "b": true, "c": "u"}', {
      status: 200,
      headers: {
        'content-type': 'application/json'
      }
    })

    const jsonSpy = sinon.spy(response, 'json')

    g.fetch.returns(Promise.resolve(response))

    return new Promise((resolve, reject) => {
      store.bind({
        ACTION_TYPE: (_, __, action: Dyad.Action) => {
          try {
            expect(jsonSpy.callCount).to.equal(1)
            expect(action.payload.value).to.deep.equal({a: 1, b: true, c: 'u'})
            resolve()
          } catch (error) {
            reject(error)
          }
        }
      })

      store.dispatch(dispatchedAction)
    })
  })

  it('rejects missing payload', () => {
    const dispatchedAction = {type: 'ACTION_TYPE', meta: {fetch: 'json'}}

    return new Promise((resolve, reject) => {
      store.bind({
        ACTION_TYPE: (_, __, ___) => reject(new Error('Dispatch succeeded without payload'))
      })

      store.dispatch(dispatchedAction).catch((error) => {
        try {
          expect(error.message).to.equal("Action 'ACTION_TYPE' missing fetch `payload` object")
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  })

  it('rejects missing URL', () => {
    const dispatchedAction = {type: 'ACTION_TYPE', meta: {fetch: 'json'}, payload: {}}

    return new Promise((resolve, reject) => {
      store.bind({
        ACTION_TYPE: (_, __, ___) => reject(new Error('Dispatch succeeded without URL'))
      })

      store.dispatch(dispatchedAction).catch((error) => {
        try {
          expect(error.message).to.equal("Action 'ACTION_TYPE' missing fetch `payload.url` property")
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  })
})
