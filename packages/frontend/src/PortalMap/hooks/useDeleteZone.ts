import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { CytoEdgeData } from '../'
import useGetPortals from '../../common/hooks/useGetPortals'
import api from '../../api'
import { ErrorActionTypes } from '../../reducers/errorReducer'

const useDeleteZone = () => {
  const checkPortals = useGetPortals()
  const dispatch = useDispatch()

  const deletePortals = useCallback(
    async (edgeData: CytoEdgeData[]) => {
      const portalIds = edgeData.map((e) => e.portalId)

      try {
        const baseUrl = process.env.REACT_APP_API_URL || ''
        await api.delete(`${baseUrl}/api/portal`, {
          data: {
            portals: portalIds,
          },
        })
        checkPortals(true)
      } catch (err: any) {
        dispatch({ type: ErrorActionTypes.ADD, error: 'Unable to delete Zone' })
      }
    },
    [checkPortals, dispatch]
  )

  return deletePortals
}

export default useDeleteZone
