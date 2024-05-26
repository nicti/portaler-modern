import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import useGetPortals from '../../common/hooks/useGetPortals'
import api from '../../api'
import { ErrorActionTypes } from '../../reducers/errorReducer'
import { ZoneActionTypes } from '../../reducers/zoneReducer'
import { Zone } from '@portaler/types'

const useDeadendZone = () => {
  const dispatch = useDispatch()

  const deadendZone = useCallback(
    async (zoneName: string) => {
      try {
        const baseUrl = process.env.REACT_APP_API_URL || ''
        await api.post(`${baseUrl}/api/zone/deadend`, {
          zoneName: zoneName,
        })
        await api.get(`${baseUrl}/api/zone/list`).then((r) => {
          dispatch({
            type: ZoneActionTypes.ADD,
            zones: r.data as Zone[],
          })
        })
      } catch (err: any) {
        dispatch({
          type: ErrorActionTypes.ADD,
          error: 'Unable to deadend Zone',
        })
      }
    },
    [dispatch]
  )

  return deadendZone
}

export default useDeadendZone
