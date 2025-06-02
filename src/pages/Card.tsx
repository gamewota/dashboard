import { useDispatch, useSelector } from 'react-redux';
import { fetchCards } from '../features/cards/cardSlice';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../store';

const Card = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {data, loading, error} = useSelector((state: RootState) => state.cards);

  useEffect(() => {
    dispatch(fetchCards());
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
              <th>Card Name</th>
              <th>Art</th>
              <th>Card Element</th>
              <th>Card Variant Id</th>
              <th>Rarity Id</th>
            </tr>
          </thead>
          <tbody>
            {data && data.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.name || '-'}</td>
                <td>{item.art || '-'}</td>
                <td>{item.element || '-'}</td>
                <td>{item.card_variant_id || '-'}</td>
                <td>{item.rarity_id || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Card