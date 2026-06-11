import { VFC } from 'react'

const Unauthorized: VFC<{ resetErrorBoundary?(): void }> = ({ resetErrorBoundary }) => {
  return <div>Unauthorized</div>
}

export default Unauthorized
