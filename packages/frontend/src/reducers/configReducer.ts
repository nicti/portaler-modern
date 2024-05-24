import clone from 'lodash/cloneDeep'
import { Reducer } from 'react'

export enum ConfigActionTypes {
  TOKEN = 'config/token',
  CLEARTOKEN = 'config/clearToken',
  SETCONFIG = 'config/set',
}

interface ConfigAction {
  type: ConfigActionTypes
  token?: string
  discordUrl?: string
  permission?: number
}

export interface ConfigState {
  token: string | null
  discordUrl: string | null
  permission: number | null
}

export const tokenStore = (): string | null => {
  if (process.env.REACT_APP_DISABLE_AUTH === 'true') {
    return 'disabled'
  }

  const token = window.localStorage.getItem('token')

  if (token === null) {
    return null
  }

  return token
}

export const permissionStore = (): number | null => {
  if (process.env.REACT_APP_DISABLE_AUTH === 'true') {
    return null
  }

  const permission = window.localStorage.getItem('permission')

  if (permission === null) {
    return null
  }

  return parseInt(permission)
}

const initialState: ConfigState = {
  token: tokenStore(),
  discordUrl: null,
  permission: permissionStore(),
}

const configReducer: Reducer<any, ConfigAction> = (
  state: ConfigState = clone(initialState),
  action: ConfigAction
): ConfigState => {
  switch (action.type) {
    case ConfigActionTypes.TOKEN:
      if (!!action.token) {
        window.localStorage.setItem('token', action.token)
        window.localStorage.setItem(
          'permission',
          action.permission?.toString() || '0'
        )
        return {
          ...state,
          token: action.token,
          permission: parseInt(String(action.permission ?? 0)),
        }
      }

      return state
    case ConfigActionTypes.CLEARTOKEN:
      window.localStorage.removeItem('token')
      window.localStorage.removeItem('permission')
      return { ...state, token: null }
    case ConfigActionTypes.SETCONFIG:
      return {
        ...state,
        discordUrl: action.discordUrl || null,
      }
    default:
      return state
  }
}

export default configReducer
