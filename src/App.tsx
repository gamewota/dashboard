import { Suspense } from 'react'
import Sidebar from './components/Sidebar'
import AppRoutes from './routes/AppRoutes'
import { useAuth } from './hooks/useAuth'

function App() {
  const auth = useAuth()
  return (
    <div data-theme="bumblebee" className="min-h-screen w-screen">
      {auth.user && <Sidebar />}

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        }
      >
        <AppRoutes />
      </Suspense>
    </div>
  )
}

export default App
