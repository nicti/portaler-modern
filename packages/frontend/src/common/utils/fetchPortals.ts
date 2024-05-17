import { Portal } from '@portaler/types'

import fetchler from '../../fetchler'
import { ConfigState } from '../../reducers/configReducer'

const fetchPortals = async (config: ConfigState): Promise<Portal[]> => {
  if (!config.token) {
    return Promise.resolve([])
  }
  const baseUrl = process.env.REACT_APP_API_URL || ''
  return await fetchler.get<Portal[]>(`${baseUrl}/api/portal`)
}

export default fetchPortals
