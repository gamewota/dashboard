import { Route, Routes } from 'react-router-dom'
import { routeConfig } from './routeConfig'

function AppRoutes() {
  return (
    <Routes>
      {routeConfig.map(({ path, component: Component }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
    </Routes>
  )
}

export default AppRoutes
