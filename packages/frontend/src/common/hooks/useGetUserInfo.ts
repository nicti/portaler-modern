import { UserInfo } from '@portaler/types'
import { useCallback, useEffect, useState } from 'react'
import api from '../../api'

const useGetUserInfo = (): UserInfo[] | null => {
  const [users_info, setUsersInfo] = useState<UserInfo[] | null>(null)

  const getUsersInfo = useCallback(async () => {
    const user_info: UserInfo[] = (await api.get('/api/user_info')).data
    setUsersInfo(user_info)
  }, [setUsersInfo])

  useEffect(() => {
    getUsersInfo()
  }, [getUsersInfo])

  return users_info
}

export default useGetUserInfo
