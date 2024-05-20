import { Portal } from '@portaler/types'

import api from '../../api'
import { ConfigState } from '../../reducers/configReducer'

const fetchPortals = async (config: ConfigState): Promise<Portal[]> => {
  if (!config.token) {
    return Promise.resolve([])
  }
  const baseUrl = process.env.REACT_APP_API_URL || ''
  return (await api.get(`${baseUrl}/api/portal`)).data
}

export default fetchPortals
