import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'

import { Zone } from '@portaler/types'

import useConfigSelector from '../../common/hooks/useConfigSelector'
import api from '../../api'
import { ZoneAction, ZoneActionTypes } from '../../reducers/zoneReducer'

const useGetZones = () => {
  const hasHydrated = useRef<boolean>(false)
  const dispatch = useDispatch()
  const config = useConfigSelector()

  useEffect(() => {
    // temporarily disable
    // This probably needs to be reworked to pull a last updated from the backend....
    const loadedState = null //zoneStorage()

    if (loadedState && !hasHydrated.current) {
      hasHydrated.current = true

      dispatch<ZoneAction>({
        type: ZoneActionTypes.HYDRATE,
        fullState: loadedState,
      })
    } else if (!loadedState && config.token) {
      hasHydrated.current = true
      const baseUrl = process.env.REACT_APP_API_URL || ''
      api.get(`${baseUrl}/api/zone/list`).then((r) => {
        dispatch({ type: ZoneActionTypes.ADD, zones: r.data as Zone[] })
      })
    }
  }, [dispatch, config])
}

export default useGetZones
