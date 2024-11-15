import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Tilgangoversikt from '../components/Tilgangoversikt'

interface Props {}
const queryClient = new QueryClient()

const Tilgang = ({}: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Tilgangoversikt />
    </QueryClientProvider>
  )
}

export default Tilgang
