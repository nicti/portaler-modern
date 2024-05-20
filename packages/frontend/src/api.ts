import axios from 'axios'

import { ConfigActionTypes, tokenStore } from './reducers/configReducer'
import { ErrorActionTypes } from './reducers/errorReducer'
import { PortalMapActionTypes } from './reducers/portalMapReducer'
import store from './store'

/*const opts: FetchlerOptions = {
  token: tokenStore(),
  handler401: () => {
    store.dispatch({ type: ErrorActionTypes.ADD, error: 'Not Authorized' })
    store.dispatch({ type: ConfigActionTypes.CLEARTOKEN })
  },
  handler403: () => {
    store.dispatch({ type: ErrorActionTypes.ADD, error: 'Forbidden' })
    store.dispatch({ type: ConfigActionTypes.CLEARTOKEN })
    store.dispatch({ type: PortalMapActionTypes.CLEARALL })
  },
  handlerError: (res) =>
    store.dispatch({
      type: ErrorActionTypes.ADD,
      error: `Error ${res?.status}`,
    }),
}

const portalerFetchler = new Fetchler(opts)*/

const portalerApi = axios.create({})

portalerApi.interceptors.request.use(
  function (config) {
    const token = window.localStorage.getItem('token')
    if (config.headers === undefined) {
      config.headers = {}
    }
    config.headers.Authorization = `Bearer ${token}`
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

portalerApi.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    return Promise.reject(error)
  }
)

export default portalerApi
