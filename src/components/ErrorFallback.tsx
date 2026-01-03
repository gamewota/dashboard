import type { FallbackProps } from 'react-error-boundary'

export function ErrorFallback({ error }: FallbackProps) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="alert alert-error shadow-lg max-w-md">
        <div>
          <span className="font-semibold">Something went wrong!</span>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </div>
    </div>
  )
}
