import { useDispatch, useSelector } from 'react-redux';
import { useEffect} from 'react';
import { fetchShopTransactions } from "../features/shopTransactions/shopTransactionsSlice"
import type { RootState, AppDispatch } from '../store';


const ShopTransactions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {data, loading, error} = useSelector((state: RootState) => state.shopTransactions);

    useEffect(() => {
      dispatch(fetchShopTransactions());
    },[dispatch]);


  return (
    <div className='min-h-screen w-screen flex flex-col items-center p-4'>
        {loading && (
        <div className='flex justify-center items-center h-64'>
          <span className="loading loading-infinity loading-xl text-warning"></span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className='flex justify-center items-center h-64'>
          <p className='font-bold text-red-500'>Error: {error}</p>
        </div>
      )}

    {!loading && !error && (!data || data.length === 0) && (
        <div className='flex justify-center items-center h-64'>
          <p>No items found.</p>
        </div>
    )}

    {!loading && !error && data && data.length > 0 && (
        <div className='overflow-x-auto'>
          <table className='table table-zebra'>
            <thead>
              <tr>
                <td>#</td>
                <td>Username</td>
                <td>Item Name</td>
                <td>Quantity</td>
                <td>Total Price</td>
                <td>Currency</td>
                <td>Status</td>
                <td>Created At</td>
                <td>Updated At</td>
                <td>Deleted At</td>
              </tr>
            </thead>
            <tbody>
              {data && data.map((item,index) => {
                return (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.username || '-'}</td>
                    <td>{item.item_name || '-'}</td>
                    <td>{item.quantity || '-'}</td>
                    <td>{item.total_price || '-'}</td>
                    <td>{item.currency || '-'}</td>
                    <td>{item.status || '-'}</td>
                    <td>{item.created_at || '-'}</td>
                    <td>{item.updated_at || '-'}</td>
                    <td>{item.deleted_at || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ShopTransactions