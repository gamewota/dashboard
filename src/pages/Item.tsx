import { useDispatch, useSelector } from 'react-redux';
import { fetchShopItems, addShopItem, updateShopItem } from '../features/shopItems/shopItemsSlice';
import { useEffect, useState } from 'react';
import type { RootState, AppDispatch } from '../store';

const Item = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.shopItems);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    price: '',
    currency: '',
    description: '',
    stock: '',
  });

  useEffect(() => {
    dispatch(fetchShopItems());
  }, [dispatch]);

  const handleToggleVisibility = async (id: number, newValue: boolean) => {
    const now = new Date().toISOString();
  
    const result = await dispatch(
      updateShopItem({
        updatedData: {
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          id,
          isVisible: newValue,
          updated_at: now,
        },
      })
    );
  
    if (updateShopItem.fulfilled.match(result)) {
      // Show success toast with message from payload
      const toastContainer = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'alert alert-success';
      toast.innerHTML = `<span>${result.payload?.message || 'Visibility updated.'}</span>`;
      toastContainer?.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      dispatch(fetchShopItems());
    } else {
      // Show error toast with message from error
      const toastContainer = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'alert alert-error';
      toast.innerHTML = `<span>${(result.payload as any)?.message || 'Failed to update visibility.'}</span>`;
      toastContainer?.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };
  

  return (
    <div className='min-h-screen w-screen flex flex-col items-center p-4'>
      {/* Add Item Button */}
      <div className='w-full max-w-5xl flex justify-end mb-4'>
        <button className='btn btn-info' onClick={() => {
              const dialog = document.getElementById('add_item') as HTMLDialogElement;
              dialog?.showModal();
        }}>
          Add Item
        </button>
      </div>

      {/* Loading */}
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

      {/* Table */}
      {!loading && !error && data && data.length > 0 && (
        <div className='overflow-x-auto w-full max-w-5xl'>
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
                <th>Visible</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Deleted At</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.name || '-'}</td>
                  <td>{item.type || '-'}</td>
                  <td>{item.price || '-'}</td>
                  <td>{item.currency || '-'}</td>
                  <td>{item.description || '-'}</td>
                  <td>{item.stock || '-'}</td>
                  <td>
                    <input
                      type="checkbox"
                      className="toggle toggle-success"
                      defaultChecked={item.isVisible}
                      onChange={() => handleToggleVisibility(item.id, !item.isVisible)}
                    />
                  </td>
                  <td>{item.created_at || '-'}</td>
                  <td>{item.updated_at || '-'}</td>
                  <td>{item.deleted_at || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <dialog id="add_item" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Add New Item</h3>
          <div className="form-control space-y-2 gap-3">
          {['name', 'type', 'price', 'currency', 'description', 'stock'].map((key) => {
          if (key === 'type') {
            return (
              <>
                <button
                  key={key}
                  className="btn bg-white"
                  popoverTarget="popover-1"
                  style={{ anchorName: "--anchor-1" } as any}
                >
                  {formData.type ? `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1).replace('_',' ')}` : 'Select Type'}
                </button>
                <ul
                  className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
                  popover="auto"
                  id="popover-1"
                  style={{ positionAnchor: "--anchor-1" } as any}
                >
                  {['gacha_pack', 'diamond', 'stamina'].map((option) => (
                    <li key={option}>
                      <a
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, type: option }))
                        }
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            );
    }
        if (key === 'currency') {
          return (
            <>
              <button
                key={key}
                className="btn bg-white"
                popoverTarget="popover-2"
                style={{ anchorName: "--anchor-2" } as any}
              >
                {formData.currency ? `${formData.currency.charAt(0).toUpperCase() + formData.currency.slice(1).replace('_',' ')}` : 'Select Currency'}
              </button>
              <ul
                className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
                popover="auto"
                id="popover-2"
                style={{ positionAnchor: "--anchor-2" } as any}
              >
                {['diamonds', 'real_money'].map((option) => (
                  <li key={option}>
                    <a
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, currency: option }))
                      }
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          );
        }
    

            return (
              <input
                key={key}
                type={key === 'price' || key === 'stock' ? 'number' : 'text'}
                placeholder={key}
                className="input input-bordered w-full"
                value={(formData as any)[key]}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            );
          })}

          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Cancel</button>
            </form>
            <button
              className="btn btn-primary"
              onClick={async () => {
                const now = new Date().toISOString();
            
                const result = await dispatch(
                  addShopItem({
                    ...formData,
                    price: Number(formData.price),
                    stock: Number(formData.stock),
                    created_at: now,
                    updated_at: now,
                  })
                );
            
                // Check if fulfilled
                if (addShopItem.fulfilled.match(result)) {
                  dispatch(fetchShopItems());
                  setFormData({
                    name: '',
                    type: '',
                    price: '',
                    currency: '',
                    description: '',
                    stock: '',
                  });
            
                  // Close the modal
                  const dialog = document.getElementById('add_item') as HTMLDialogElement;
                  dialog?.close();
            
                  // Show success toast with message from payload
                  const toastContainer = document.getElementById('toast-container');
                  const toast = document.createElement('div');
                  toast.className = 'alert alert-success';
                  toast.innerHTML = `<span>${result.payload?.message || 'Item added successfully!'}</span>`;
                  toastContainer?.appendChild(toast);
                  setTimeout(() => toast.remove(), 3000);
                } else if (addShopItem.rejected.match(result)) {
                  // Show error toast with message from error
                  const toastContainer = document.getElementById('toast-container');
                  const toast = document.createElement('div');
                  toast.className = 'alert alert-error';
                  toast.innerHTML = `<span>${(result.payload as any)?.message || 'Failed to add item.'}</span>`;
                  toastContainer?.appendChild(toast);
                  setTimeout(() => toast.remove(), 3000);
                }
              }}
            >
              Add
            </button>
          </div>
        </div>
      </dialog>
      <div className="toast toast-top toast-end z-50" id="toast-container"></div>
    </div>
  );
};

export default Item;
