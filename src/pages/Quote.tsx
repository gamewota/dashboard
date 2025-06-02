import { useDispatch, useSelector } from 'react-redux';
import { fetchQuotes } from '../features/quotes/quoteSlice';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../store';

const Quote = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {data, loading, error} = useSelector((state: RootState) => state.quotes);

  useEffect(() => {
    dispatch(fetchQuotes());
  },[dispatch]);
  if (loading) return (
    <div className='min-h-screen w-screen flex justify-center items-center'>
      <p>Loading...</p>
    </div>
  )
  if (error) return (
    <div className='min-h-screen w-screen flex justify-center items-center'>
      <p className='text-bold'>Error: {error}</p>
    </div>
  )
  if (!data || data.length === 0) return (
    <div className='min-h-screen w-screen flex justify-center items-center'>
      <p>No items found.</p>
    </div>
  )
  return (
    <div className='min-h-screen w-screen flex justify-center'>
      <div className='overflow-x-auto'>
        <table className='table table-zebra'>
          <thead>
            <tr>
              <td>#</td>
              <td>Quote Text</td>
            </tr>
          </thead>
          <tbody>
            {data && data.map((quote,index) => {
              return (
                <tr key={quote.id}>
                  <td>{index + 1}</td>
                  <td>{quote.text}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Quote