import { Suspense, useEffect, useState } from 'react'
import Container from '../components/Container'
import type { GachaPack as GachaPackType } from '../features/cards/gachaPackSlice'
import { useDispatch, useSelector } from 'react-redux';
import { fetchGachaPacks, createGachaPack, type GachaPackPayload } from '../features/cards/gachaPackSlice';
import { fetchCurrencies } from '../features/currencies/currencySlice';
import { fetchGameItems } from '../features/gameItems/gameItemsSlice';
import type { GameItem } from '../lib/schemas/gameItem';
import type { CurrencyType } from '../features/currencies/currencySlice';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingFallback } from '../components/LoadingFallback';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';


function GachaPackTable({ packs }: { packs: GachaPackType[] }) {
  const navigate = useNavigate()
  const columns = [
    {header: '#', accessor: (row: GachaPackType) => <Button size='xs' onClick={() => navigate(`/dashboard/cards/gacha-pack/${row.id}`)} variant='info'>Detail</Button>},
    { header: 'ID', accessor: 'id' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Price', accessor: 'price' as const },
    { header: 'Currency', accessor: (row: GachaPackType) => (row.currency_name == null ? '-' : String(row.currency_name)) },
    { header: 'Item', accessor: (row: GachaPackType) => (row.item_name == null ? '-' : String(row.item_name)) },
  ]

  return <ErrorBoundary FallbackComponent={() => <div>Error loading gacha packs.</div>}> 
  <Suspense fallback={<div>Loading...</div>}>
    <DataTable columns={columns} data={packs} emptyMessage="No gacha packs available." />
  </Suspense>
  </ErrorBoundary>;
}


const GachaPack = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list: gachaPacks = [], listLoading: loading, error } = useSelector((state: RootState) => state.gachaPack);
  const currencies = useSelector((state: RootState) => state.currency.data);
  const gameItems = useSelector((state: RootState) => state.gameItems.data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCurrencyId, setSelectedCurrencyId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    dispatch(fetchGachaPacks());
  }, [dispatch]);

  useEffect(() => {
    if (isModalOpen) {
      dispatch(fetchCurrencies());
      dispatch(fetchGameItems());
    }
  }, [isModalOpen, dispatch]);

  const handleSubmit = async () => {
    if (!name || price === '') return showToast('Name and price are required', 'warning');
    if (!selectedCurrencyId && !selectedItemId) return showToast('Select either a currency or a game item', 'warning');
    if (selectedCurrencyId && selectedItemId) return showToast('Please select only one: currency OR game item', 'warning');
    setSubmitting(true);
    const payload: GachaPackPayload = {
      name,
      price: Number(price),
      ...(selectedCurrencyId ? { currencyId: Number(selectedCurrencyId) } : {}),
      ...(selectedItemId ? { itemId: Number(selectedItemId) } : {}),
    };
    try {
      const action = await dispatch(createGachaPack(payload));
      if (createGachaPack.fulfilled.match(action)) {
        showToast('Gacha pack created', 'success');
        setIsModalOpen(false);
        setName('');
        setPrice('');
        dispatch(fetchGachaPacks());
      } else if (createGachaPack.rejected.match(action)) {
        const msg = action.payload ?? action.error?.message ?? 'Failed to create gacha pack';
        showToast(String(msg), 'error');
      } else {
        showToast('Failed to create gacha pack', 'error');
      }
    } catch (err: unknown) {
      if (err instanceof Error) showToast(err.message, 'error');
      else showToast(String(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingFallback />
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div className="alert alert-error shadow-lg">
          <div>
            <span className="font-semibold">Failed to load gacha packs</span>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div>
        <div className='mb-6 flex items-center justify-between'>
            <h1 className='text-3xl font-bold'>Gacha Packs</h1>
            <div>
              <Button onClick={() => setIsModalOpen(true)}>Add Gacha</Button>
            </div>
        </div>
        <GachaPackTable packs={gachaPacks} />
        <Modal
          title="Create Gacha Pack"
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedCurrencyId(''); setSelectedItemId(''); }}
          footer={(
            <>
              <Button variant='ghost' onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create'}
              </Button>
            </>
          )}
        >
          <div className='grid gap-3'>
            <label className='flex flex-col'>
              <span className='text-sm'>Name</span>
              <input className='input input-bordered' value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className='flex flex-col'>
              <span className='text-sm'>Price</span>
              <input className='input input-bordered' value={price} onChange={(e) => setPrice(e.target.value)} type='number' />
            </label>

            <label className='flex flex-col'>
              <span className='text-sm'>Currency (choose OR item)</span>
              <div className='flex gap-2'>
                <select
                  className='select select-bordered flex-1'
                  value={selectedCurrencyId}
                  onChange={(e) => {
                    setSelectedCurrencyId(e.target.value);
                    if (e.target.value) setSelectedItemId('');
                  }}
                  disabled={Boolean(selectedItemId)}
                >
                  <option value=''>-- Select currency --</option>
                  {currencies?.map((c: CurrencyType) => (
                    <option key={c.id} value={String(c.id)}>{c.name}{c.code ? ` (${c.code})` : ''}</option>
                  ))}
                </select>
                {selectedCurrencyId && (
                  <button className='btn btn-outline btn-sm' onClick={() => setSelectedCurrencyId('')}>Clear</button>
                )}
              </div>
              <p className='text-xs text-content-400 mt-1'>Selecting a currency will disable the item select. Use Clear to switch.</p>
            </label>

            <label className='flex flex-col'>
              <span className='text-sm'>Game Item (choose OR currency)</span>
              <div className='flex gap-2'>
                <select
                  className='select select-bordered flex-1'
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    if (e.target.value) setSelectedCurrencyId('');
                  }}
                  disabled={Boolean(selectedCurrencyId)}
                >
                  <option value=''>-- Select game item --</option>
                  {gameItems?.map((it: GameItem) => (
                    <option key={it.id} value={String(it.id)}>{it.name}</option>
                  ))}
                </select>
                {selectedItemId && (
                  <button className='btn btn-outline btn-sm' onClick={() => setSelectedItemId('')}>Clear</button>
                )}
              </div>
              <p className='text-xs text-content-400 mt-1'>Selecting an item will disable the currency select. Use Clear to switch.</p>
            </label>
          </div>
        </Modal>
        <ToastContainer />
      </div>
    </Container>
  )
}

export default GachaPack