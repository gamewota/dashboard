import { Suspense } from 'react'
import AppLayout from './components/AppLayout'
import AppRoutes from './routes/AppRoutes'
import { useAuth } from './hooks/useAuth'

const LoadingFallback = (
  <div className="flex items-center justify-center h-screen">
    <span className="loading loading-spinner loading-lg"></span>
  </div>
)

function App() {
  const auth = useAuth()

  return (
    <div data-theme="bumblebee" className="min-h-screen">
      {auth.user ? (
        <AppLayout>
          <Suspense fallback={LoadingFallback}>
            <AppRoutes />
          </Suspense>
        </AppLayout>
      ) : (
        <Suspense fallback={LoadingFallback}>
          <AppRoutes />
        </Suspense>
      )}
    </div>
  )
}

export default App
