import { useCallback } from 'react'

import { PortalPayload } from '@portaler/types'

import useGetPortals from '../common/hooks/useGetPortals'
import fetchler from '../fetchler'

const useAddPortal = () => {
  const checkPortals = useGetPortals()
  return useCallback(
    async (portal: PortalPayload) => {
      const baseUrl = process.env.REACT_APP_API_URL || ''
      await fetchler.post(`${baseUrl}/api/portal`, { ...portal })

      await checkPortals(true)
    },
    [checkPortals]
  )
}

export default useAddPortal
