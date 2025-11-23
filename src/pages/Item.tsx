import { useDispatch, useSelector } from 'react-redux';
import { fetchShopItems, addShopItem, updateShopVisibility } from '../features/shopItems/shopItemsSlice';
import { useEffect, useState } from 'react';
import { useToast } from '../hooks/useToast';
import Container from '../components/Container';
import { Button } from '../components/Button';
import type { RootState, AppDispatch } from '../store';

const Item = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.shopItems);
  type ItemForm = {
    name: string;
    type: string;
    price: string;
    currency: string;
    description: string;
    stock: string;
  };

  const [formData, setFormData] = useState<ItemForm>({
    name: '',
    type: '',
    price: '',
    currency: '',
    description: '',
    stock: '',
  });

  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    dispatch(fetchShopItems());
  }, [dispatch]);

  const handleToggleVisibility = async (id: number, newValue: boolean) => {
    const now = new Date().toISOString();
  
    const result = await dispatch(
      updateShopVisibility({
        updatedData: {
          id,
          isVisible: newValue,
          updated_at: now,
        },
      })
    );
  
    if (updateShopVisibility.fulfilled.match(result)) {
      showToast(result.payload?.message || 'Visibility updated.', 'success');
      dispatch(fetchShopItems());
    } else {
      const payload = result.payload as { message?: string } | undefined;
      showToast(payload?.message || 'Failed to update visibility.', 'error');
    }
  };
  

  return (
    <Container className="flex-col items-center p-4">
      {/* Add Item Button */}
      <div className='w-full max-w-5xl flex justify-end mb-4'>
        <Button variant="info" onClick={() => {
              const dialog = document.getElementById('add_item') as HTMLDialogElement;
              dialog?.showModal();
        }}>
          Add Item
        </Button>
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
          {(['name', 'type', 'price', 'currency', 'description', 'stock'] as (keyof ItemForm)[]).map((key) => {
          if (key === 'type') {
            return (
              <>
                <Button
                  key={key}
                  className="bg-white"
                  popoverTarget="popover-1"
                  style={{ anchorName: "--anchor-1" } as React.CSSProperties}
                >
                  {formData.type ? `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1).replace('_',' ')}` : 'Select Type'}
                </Button>
                <ul
                  className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
                  popover="auto"
                  id="popover-1"
                  style={{ positionAnchor: "--anchor-1" } as React.CSSProperties}
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
              <Button
                key={key}
                className="bg-white"
                popoverTarget="popover-2"
                style={{ anchorName: "--anchor-2" } as React.CSSProperties}
              >
                {formData.currency ? `${formData.currency.charAt(0).toUpperCase() + formData.currency.slice(1).replace('_',' ')}` : 'Select Currency'}
              </Button>
              <ul
                className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
                popover="auto"
                id="popover-2"
                style={{ positionAnchor: "--anchor-2" } as React.CSSProperties}
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
                value={formData[key] as string}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            );
          })}

          </div>
          <div className="modal-action">
            <form method="dialog">
              <Button>Cancel</Button>
            </form>
            <Button
              variant="primary"
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
                  showToast(result.payload?.message || 'Item added successfully!', 'success');
                } else if (addShopItem.rejected.match(result)) {
                  // Show error toast with message from error
                  const payload = result.payload as { message?: string } | undefined;
                  showToast(payload?.message || 'Failed to add item.', 'error');
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
  );
};

export default Item;
