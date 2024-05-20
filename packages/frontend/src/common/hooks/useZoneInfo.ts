import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Zone } from '@portaler/types'

import api from '../../api'
import { RootState } from '../../reducers'
import { ZoneActionTypes } from '../../reducers/zoneReducer'
import useZoneListSelector from './useZoneListSelector'

const useZoneInfo = (): Zone | null => {
  const dispatch = useDispatch()
  const zoneList = useZoneListSelector()
  const id = useSelector((state: RootState) => state.portalMap.inspectFromId)
  const [zone, setZone] = useState<Zone | null>(null)

  const getZone = useCallback(
    async (id: number | null) => {
      let newZone: Zone | null = null

      if (id) {
        newZone = zoneList.find((z) => z.id === id) ?? null

        if (!newZone?.info?.markers) {
          const baseUrl = process.env.REACT_APP_API_URL || ''
          const zoneInfo = (await api.get(`${baseUrl}/api/zone/info/${id}`))
            .data

          dispatch({ type: ZoneActionTypes.ADD_INFO, zoneInfo })
        }
      }

      setZone(newZone)
    },
    [zoneList, dispatch]
  )

  useEffect(() => {
    getZone(id)
  }, [getZone, id])

  return zone
}

export default useZoneInfo
