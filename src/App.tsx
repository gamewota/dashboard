import Sidebar from "./components/Sidebar"
import {Route, Routes} from 'react-router-dom'
import Home from "./pages/Home"
import Card from "./pages/Card"
import Song from "./pages/Song"
import Quote from "./pages/Quote"
import User from "./pages/User"
import Item from "./pages/Item"
import ShopTransactions from "./pages/ShopTransactions"
import TransactionLog from './pages/TransactionLog'
import ForgotPassword from "./pages/ForgotPassword"
import VerifyUser from "./pages/VerifyUser"
import ResendVerification from "./pages/ResendVerification"
import { useAuth } from "./hooks/useAuth"
function App() {
  const auth = useAuth()
  return (
    <div data-theme="bumblebee" className="min-h-screen w-screen">
      {auth.user && (
        <Sidebar />
      )}

      <Routes>
        <Route path="/dashboard/" element={<Home />}/>
        <Route path="/dashboard/cards" element={<Card />}/>
        <Route path="/dashboard/songs" element={<Song />}/>
        <Route path="/dashboard/quotes" element={<Quote />}/>
        <Route path="/dashboard/users" element={<User />}/>
        <Route path="/dashboard/items" element={<Item />}/>
        <Route path="/dashboard/shop-history" element={<ShopTransactions />}/>
        <Route path="/dashboard/transaction-log" element={<TransactionLog />}/>
        <Route path="/dashboard/forgot-password" element={<ForgotPassword />}/>
        <Route path="/dashboard/verify" element={<VerifyUser />}/>
        <Route path="/dashboard/resend-verify" element={<ResendVerification />}/>
      </Routes>
    </div>
  )
}

export default App
