import { useDispatch, useSelector } from 'react-redux';
import { fetchQuotes, addQuote } from '../features/quotes/quoteSlice';
import { useEffect, useState } from 'react';
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


  return (
    <div className='min-h-screen w-screen flex flex-col items-center p-4'>


      <div className='w-full max-w-5xl flex justify-end mb-4'>
        <button className='btn btn-info' onClick={() => {
              const dialog = document.getElementById('add_quotes') as HTMLDialogElement;
              dialog?.showModal();
        }}>
          Add Quotes
        </button>
      </div>


      {loading && (
        <div className='flex justify-center items-center h-64'>
          <p>Loading...</p>
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
              <button className="btn">Cancel</button>
            </form>
            <button
              className="btn btn-primary"
              onClick={async () => {
                const result = await dispatch(addQuote({
                  ...formData
                }))

                if(addQuote.fulfilled.match(result)) {
                  dispatch(fetchQuotes())
                  setFormData({text: ''});


                  const dialog = document.getElementById('add_quotes') as HTMLDialogElement;
                  dialog?.close();

                  const toastContainer = document.getElementById('toast-container-quotes');
                  const toast = document.createElement('div');
                  toast.className = 'alert alert-success';
                  toast.innerHTML = `<span>${result.payload.message || 'Quote added successfully!'}</span>`;
                  toastContainer?.appendChild(toast);
                  setTimeout(() => {
                    toast.remove();
                  }, 3000)
                } else if(addQuote.rejected.match(result)) {
                  const toastContainer = document.getElementById('toast-container-quotes');
                  const toast = document.createElement('div');
                  toast.className = 'alert alert-error';
                  toast.innerHTML = `<span>${(result.payload as any).message || 'Failed to add quote'}</span>`;
                  toastContainer?.appendChild(toast);
                  setTimeout(() => {
                    toast.remove();
                  }, 3000)
                }
              }}
            >
              Add
            </button>
          </div>
        </div>
      </dialog>
      <div className="toast toast-top toast-end z-50" id="toast-container-quotes"></div>
    </div>
  )
}

export default Quote