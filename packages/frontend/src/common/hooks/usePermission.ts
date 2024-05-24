import { useSelector } from 'react-redux'

import { RootState } from '../../reducers'

/**
 * Get and update the token
 *
 * @return token
 **/
const usePermission = (): number | null =>
  useSelector((state: RootState) => state.config.permission)

export default usePermission
