import { useDispatch, useSelector } from 'react-redux';
import { fetchShopItems } from '../features/shopItems/shopItemsSlice';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../store';

const Item = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {data, loading, error} = useSelector((state: RootState) => state.shopItems);

  useEffect(() => {
    dispatch(fetchShopItems());
  }, [dispatch]);
  if (loading) return <p>Loading...</p>;
  if (error) return <p className='text-bold'>Error: {error}</p>;
  if (!data || data.length === 0) return <p>No items found.</p>;
  return (
    <div className='min-h-screen w-screen flex justify-center'>
      <div className='overflow-x-auto'>
        <table className='table table-zebra'>
          <thead>
            <tr>
              <th>#</th>
              <th>Item Name</th>
              <th>Type</th>
              <th>Item Price</th>
              <th>Currency</th>
              <th>Item Description</th>
              <th>Stock</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Deleted At</th>
            </tr>
          </thead>
          <tbody>
            {data && data.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.name || '-'}</td>
                <td>{item.type || '-'}</td>
                <td>{item.price || '-'}</td>
                <td>{item.currency || '-'}</td>
                <td>{item.description || '-'}</td>
                <td>{item.stock || '-'}</td>
                <td>{item.created_at || '-'}</td>
                <td>{item.updated_at || '-'}</td>
                <td>{item.deleted_at || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Item