import { useDispatch, useSelector } from 'react-redux';
import { useEffect} from 'react';
import { fetchTransactionsLog } from '../features/transactionLog/transactionLogSlice';
import type { RootState, AppDispatch } from '../store';
import Container from '../components/Container';


const ShopTransactions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {data, loading, error} = useSelector((state: RootState) => state.transactionsLog);

    useEffect(() => {
      dispatch(fetchTransactionsLog());
    },[dispatch]);


  return (
    <Container className='flex-col items-center p-4'>
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
                <td>Log Id</td>
                <td>Transaction Id</td>
                <td>Total Amount</td>
                <td>MDR Rate</td>
                <td>From Status</td>
                <td>To Status</td>
                <td>Remarks</td>
                <td>Created At</td>
              </tr>
            </thead>
            <tbody>
              {data && data.map((item,index) => {
                return (
                  <tr key={item.logId}>
                    <td>{index + 1}</td>
                    <td>{item.logId || '-'}</td>
                    <td>{item.transactionId || '-'}</td>
                    <td>{item.totalAmount || '-'}</td>
                    <td>{item.MDRRate || '-'}</td>
                    <td>{item.fromStatus || '-'}</td>
                    <td>{item.toStatus || '-'}</td>
                    <td>{item.remarks || '-'}</td>
                    <td>{item.createdAt || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  )
}

export default ShopTransactions