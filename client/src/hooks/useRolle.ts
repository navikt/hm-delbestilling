import { useQuery } from '@tanstack/react-query'

import rest from '../services/rest'
import { DelbestillerrolleResponse } from '../types/HttpTypes'

export const QUERY_KEY_DELBESTILLERROLLE = 'delbestillerrolle'

export const useRolle = () => {
  return useQuery<DelbestillerrolleResponse>({
    queryKey: [QUERY_KEY_DELBESTILLERROLLE],
    queryFn: () => rest.hentRolle(),
    retry: false,
  })
}
