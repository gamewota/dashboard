import { Suspense, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom';
import Container from '../components/Container';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGachaPacksDetail, fetchGachaPackById } from '../features/cards/gachaPackSlice';
import { fetchCards } from '../features/cards/cardSlice';
import { addGachaPackCard } from '../features/cards/gachaPackCardSlice';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import { useToast } from '../hooks/useToast';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';
import { LoadingFallback } from '../components/LoadingFallback';
import type { GachaPackDetail as GachaPackDetailType } from '../features/cards/gachaPackSlice';
import { ErrorBoundary } from 'react-error-boundary';



function GachaPackDetailTable({ packs }: { packs: GachaPackDetailType[] }) {
    const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Cards', accessor: (row: GachaPackDetailType) => row.url ? <img src={row.url} alt={row.name} className="h-16 w-16 object-cover rounded" /> : '-' },
    { header: 'Cards Variant', accessor: 'variant_name' as const },
    { header: 'Rarity', accessor: 'rarity_name' as const },
    { header: 'Element', accessor: 'element_name' as const },
    { header: 'Member', accessor: 'member_name' as const },
  ]

  return <ErrorBoundary FallbackComponent={() => <div>Error loading gacha packs.</div>}> 
  <Suspense fallback={<div>Loading...</div>}>
    <DataTable columns={columns} data={packs} />
  </Suspense>
  </ErrorBoundary>;
}


const GachaPackDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { details: gachaPackDetails = [], detailsLoading: loading, error, pack: gachaPack } = useSelector((state: RootState) => state.gachaPack);
  const dispatch = useDispatch<AppDispatch>();
  const cards = useSelector((state: RootState) => state.cards.data ?? []);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
  const [cardFilter, setCardFilter] = useState('');
  const [weight, setWeight] = useState<number>(1);
  const { showToast, ToastContainer } = useToast();

  const existingCardIds = useMemo(() => new Set(gachaPackDetails.map((d) => d.id)), [gachaPackDetails]);

    useEffect(() => {
      const parsedId = Number(id);
      if (!Number.isFinite(parsedId) || parsedId <= 0) return;
      dispatch(fetchGachaPacksDetail(parsedId));
      dispatch(fetchGachaPackById(parsedId));
      dispatch(fetchCards());
    }, [dispatch, id]);

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

    // If there are no details, still render the page so user can add cards.
    // The table below will show an empty state when `gachaPackDetails` is empty.


  return (
    <Container>
      <div>
        <div className='mb-6 flex items-center justify-between'>
          <div>Gacha Pack Details for: {gachaPack?.name ?? '—'}</div>
          <div>
            <Button onClick={() => setIsAddOpen(true)}>Add Cards</Button>
          </div>
        </div>
        <GachaPackDetailTable packs={gachaPackDetails} />
        <Modal
          title="Add Cards to Gacha Pack"
          isOpen={isAddOpen}
          onClose={() => { setIsAddOpen(false); setSelectedCardIds([]); setWeight(1); }}
          footer={(
            <>
              <Button variant='ghost' onClick={() => { setIsAddOpen(false); setSelectedCardIds([]); setWeight(1); }}>Cancel</Button>
              <Button onClick={async () => {
                if (!id) return showToast('Missing gacha pack id', 'error');
                if (selectedCardIds.length === 0) return showToast('Select at least one card', 'warning');
                const payload = {
                  gachaPackId: Number(id),
                  cardId: selectedCardIds.map((s) => Number(s)),
                  weight,
                };
                try {
                  await dispatch(addGachaPackCard(payload)).unwrap();
                  showToast('Cards added to gacha pack', 'success');
                  setIsAddOpen(false);
                  setSelectedCardIds([]);
                  setWeight(1);
                  dispatch(fetchGachaPacksDetail(Number(id)));
                } catch (err: unknown) {
                  if (err instanceof Error) showToast(err.message, 'error');
                  else showToast(String(err), 'error');
                }
              }}>Add</Button>
            </>
          )}
        >
          <div className='grid gap-3'>
            <label className='flex flex-col'>
              <span className='text-sm'>Select Cards</span>
              <input
                className='input input-bordered my-2'
                placeholder='Filter cards by name'
                value={cardFilter}
                onChange={(e) => setCardFilter(e.target.value)}
              />
              <div className='border rounded p-2 max-h-48 overflow-y-auto'>
                {cards
                  .filter(c => !existingCardIds.has(c.id))
                  .filter(c => c.name.toLowerCase().includes(cardFilter.toLowerCase()))
                  .map((c) => (
                  <label key={c.id} className='flex items-center gap-2 py-1'>
                    <input
                      type='checkbox'
                      className='checkbox'
                      checked={selectedCardIds.includes(c.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCardIds((s) => Array.from(new Set([...s, c.id])));
                        else setSelectedCardIds((s) => s.filter(x => x !== c.id));
                      }}
                    />
                    <span>{c.name}</span>
                  </label>
                ))}
                {cards.filter(c => !existingCardIds.has(c.id)).filter(c => c.name.toLowerCase().includes(cardFilter.toLowerCase())).length === 0 && (
                  <div className='text-sm text-content-400'>No cards match the filter or all cards are already added.</div>
                )}
              </div>
            </label>
            <label className='flex flex-col'>
              <span className='text-sm'>Weight</span>
              <input className='input input-bordered' type='number' min={1} value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
            </label>
          </div>
        </Modal>
        <ToastContainer />
      </div>
    </Container>
  )
}

export default GachaPackDetails