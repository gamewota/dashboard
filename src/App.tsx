import Sidebar from "./components/Sidebar"
import {Route, Routes} from 'react-router-dom'
import Home from "./pages/Home"
import Card from "./pages/Card"
import Song from "./pages/Song"
import Quote from "./pages/Quote"
import User from "./pages/User"
import Item from "./pages/Item"
import ShopTransactions from "./pages/ShopTransactions"
function App() {

  return (
    <div data-theme="bumblebee" className="min-h-screen w-screen">
      <Sidebar />

      <Routes>
        <Route path="/dashboard/" element={<Home />}/>
        <Route path="/dashboard/cards" element={<Card />}/>
        <Route path="/dashboard/songs" element={<Song />}/>
        <Route path="/dashboard/quotes" element={<Quote />}/>
        <Route path="/dashboard/users" element={<User />}/>
        <Route path="/dashboard/items" element={<Item />}/>
        <Route path="/dashboard/shop-history" element={<ShopTransactions />}/>
      </Routes>
    </div>
  )
}

export default App
