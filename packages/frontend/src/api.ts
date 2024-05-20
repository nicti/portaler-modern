import axios from 'axios'

import { ConfigActionTypes, tokenStore } from './reducers/configReducer'
import { ErrorActionTypes } from './reducers/errorReducer'
import { PortalMapActionTypes } from './reducers/portalMapReducer'
import store from './store'

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
    if (error.response.status === 401) {
      store.dispatch({ type: ErrorActionTypes.ADD, error: 'Not Authorized' })
      store.dispatch({ type: ConfigActionTypes.CLEARTOKEN })
    } else if (error.response.status === 403) {
      store.dispatch({ type: ErrorActionTypes.ADD, error: 'Forbidden' })
      store.dispatch({ type: ConfigActionTypes.CLEARTOKEN })
      store.dispatch({ type: PortalMapActionTypes.CLEARALL })
    } else {
      store.dispatch({
        type: ErrorActionTypes.ADD,
        error: `Error ${error.response.status}: ${error.response.data}`,
      })
    }
    return Promise.reject(error)
  }
)

export default portalerApi
