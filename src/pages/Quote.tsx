import { useDispatch, useSelector } from 'react-redux';
import { fetchQuotes, addQuote } from '../features/quotes/quoteSlice';
import { useEffect, useState } from 'react';
import { useToast } from '../hooks/useToast';
import Container from '../components/Container';
import Button from '../components/Button';
import type { RootState, AppDispatch } from '../store';

const Quote = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {data, loading, error} = useSelector((state: RootState) => state.quotes);
  const [formData, setFormData] = useState({
    text: ''
  })
  

  useEffect(() => {
    dispatch(fetchQuotes());
  },[dispatch]);

  const { showToast, ToastContainer } = useToast();

  return (
    <Container className='flex-col items-center p-4'>


      <div className='w-full max-w-5xl flex justify-end mb-4'>
        <Button variant="info" onClick={() => {
              const dialog = document.getElementById('add_quotes') as HTMLDialogElement;
              dialog?.showModal();
        }}>
          Add Quotes
        </Button>
      </div>


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

      {/* No Data */}
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
      )}

      <dialog id="add_quotes" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Add New Item</h3>
          <div className="form-control space-y-2 gap-3">
            <input
                className="input input-bordered w-full mt-2"
                placeholder='Quote Text'
                value={formData.text}
                onChange={(e) => setFormData({...formData, text: e.target.value})}
              />
          </div>
          <div className="modal-action">
            <form method="dialog">
              <Button>Cancel</Button>
            </form>
            <Button
              variant="primary"
              onClick={async () => {
                const result = await dispatch(addQuote({
                  ...formData
                }))

                if(addQuote.fulfilled.match(result)) {
                  dispatch(fetchQuotes())
                  setFormData({text: ''});


                  const dialog = document.getElementById('add_quotes') as HTMLDialogElement;
                  dialog?.close();
                  showToast(result.payload?.message || 'Quote added successfully!', 'success');
                } else if(addQuote.rejected.match(result)) {
                  const payload = result.payload as { message?: string } | undefined;
                  showToast(payload?.message || 'Failed to add quote', 'error');
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </dialog>
  <ToastContainer />
    </Container>
  )
}

export default Quote