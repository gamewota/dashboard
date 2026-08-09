import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom';
import Container from '../components/Container';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGachaPackDetail,
  updateGachaPack,
  replacePityRules,
} from '../features/cards/gachaPackSlice';
import { fetchCards } from '../features/cards/cardSlice';
import { fetchRarities } from '../features/cards/raritySlice';
import { addGachaPackCard } from '../features/cards/gachaPackCardSlice';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import { useToast } from '../hooks/useToast';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';
import { LoadingFallback } from '../components/LoadingFallback';
import { GachaPackListingControls } from '../components/GachaPackListingControls';
import { GachaPackPityRules } from '../components/GachaPackPityRules';
import { formatPackPrice } from '../helpers/gachaPackFormat';
import type {
  GachaPackCard,
  GachaPackDetail as GachaPackDetailType,
  GachaPackPityRule,
  GachaPackUpdateInput,
} from '../lib/schemas/gachaPack';
import { ErrorBoundary } from 'react-error-boundary';

/** Renders the pack's cards with their pull weight and effective drop probability. */
function GachaPackCardTable({
  cards,
  featuredCardId,
}: {
  cards: GachaPackCard[];
  featuredCardId: number | null;
}) {
  const columns = [
    { header: 'ID', accessor: (row: GachaPackCard) => row.id },
    {
      header: 'Name',
      accessor: (row: GachaPackCard) => (
        <div className='flex items-center gap-2'>
          <span>{row.name}</span>
          {row.id === featuredCardId && <span className='badge badge-sm badge-warning'>Featured</span>}
        </div>
      ),
    },
    {
      header: 'Art',
      accessor: (row: GachaPackCard) =>
        row.art ? (
          <img src={row.art} alt={row.name} className='h-16 w-16 object-cover rounded' />
        ) : (
          '-'
        ),
    },
    { header: 'Rarity', accessor: (row: GachaPackCard) => row.rarityName },
    { header: 'Weight', accessor: (row: GachaPackCard) => row.weight },
    {
      header: 'Effective probability',
      accessor: (row: GachaPackCard) => `${(row.effectiveProbability * 100).toFixed(2)}%`,
    },
  ]

  return (
    <ErrorBoundary FallbackComponent={() => <div>Error loading gacha pack cards.</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable
          columns={columns}
          data={cards}
          rowKey={(row) => row.id}
          emptyMessage='No cards in this pack yet.'
        />
      </Suspense>
    </ErrorBoundary>
  );
}

/** Summary line describing how the pack is paid for. */
function PackSummary({ pack }: { pack: GachaPackDetailType }) {
  const payWith = pack.currency?.name ?? pack.item?.name ?? null;
  return (
    <div className='flex flex-wrap items-center gap-3 text-sm text-content-400'>
      <span>Price: {formatPackPrice(pack.price, payWith)}</span>
      <span>·</span>
      <span>{pack.cards.length} cards</span>
      {pack.featuredCard && (
        <>
          <span>·</span>
          <span>Featured: {pack.featuredCard.name}</span>
        </>
      )}
    </div>
  );
}

const GachaPackDetails = () => {
  const { id } = useParams<{ id: string }>();
  const packId = Number(id);
  const isValidPackId = Number.isFinite(packId) && packId > 0;

  const dispatch = useDispatch<AppDispatch>();
  const { detail, detailsLoading, updating, pityLoading, error } = useSelector(
    (state: RootState) => state.gachaPack,
  );
  const cards = useSelector((state: RootState) => state.cards.data ?? []);
  const rarities = useSelector((state: RootState) => state.rarity.data ?? []);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
  const [cardFilter, setCardFilter] = useState('');
  const [weight, setWeight] = useState<number>(1);
  const { showToast, ToastContainer } = useToast();

  const packCards = useMemo(() => detail?.cards ?? [], [detail]);
  const pityRules = useMemo(() => detail?.pityRules ?? [], [detail]);
  const existingCardIds = useMemo(
    () => new Set(packCards.map((card) => card.id)),
    [packCards],
  );

  useEffect(() => {
    if (!isValidPackId) return;
    dispatch(fetchGachaPackDetail(packId));
    dispatch(fetchCards());
    dispatch(fetchRarities());
  }, [dispatch, packId, isValidPackId]);

  const handleSaveListing = useCallback(
    async (changes: GachaPackUpdateInput) => {
      if (Object.keys(changes).length === 0) {
        showToast('Nothing to save', 'info');
        return;
      }
      try {
        await dispatch(updateGachaPack({ id: packId, changes })).unwrap();
        showToast('Listing updated', 'success');
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : String(err), 'error');
      }
    },
    [dispatch, packId, showToast],
  );

  // The API replaces the whole rule set, so create and delete both send the full list.
  const handleCreatePityRule = useCallback(
    async (rule: GachaPackPityRule) => {
      try {
        await dispatch(
          replacePityRules({ gachaPackId: packId, rules: [...pityRules, rule] }),
        ).unwrap();
        showToast('Pity rule added', 'success');
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : String(err), 'error');
      }
    },
    [dispatch, packId, pityRules, showToast],
  );

  const handleDeletePityRule = useCallback(
    async (rule: GachaPackPityRule) => {
      const remaining = pityRules.filter(
        (existing) => existing.triggerCount !== rule.triggerCount,
      );
      try {
        await dispatch(replacePityRules({ gachaPackId: packId, rules: remaining })).unwrap();
        showToast('Pity rule deleted', 'success');
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : String(err), 'error');
      }
    },
    [dispatch, packId, pityRules, showToast],
  );

  const closeAddModal = () => {
    setIsAddOpen(false);
    setSelectedCardIds([]);
    setWeight(1);
  };

  const handleAddCards = async () => {
    if (!isValidPackId) return showToast('Missing gacha pack id', 'error');
    if (selectedCardIds.length === 0) return showToast('Select at least one card', 'warning');
    const finalWeight = Math.max(1, weight);
    try {
      await dispatch(
        addGachaPackCard({
          gachaPackId: packId,
          cardId: selectedCardIds,
          weight: finalWeight,
        }),
      ).unwrap();
      showToast('Cards added to gacha pack', 'success');
      closeAddModal();
      dispatch(fetchGachaPackDetail(packId));
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    }
  };

  if (!isValidPackId) {
    return (
      <Container>
        <div className='alert alert-error shadow-lg'>
          <span className='font-semibold'>Invalid gacha pack id.</span>
        </div>
      </Container>
    )
  }

  if (detailsLoading && !detail) {
    return (
      <Container>
        <LoadingFallback />
      </Container>
    )
  }

  if (error && !detail) {
    return (
      <Container>
        <div className="alert alert-error shadow-lg">
          <div>
            <span className="font-semibold">Failed to load gacha pack</span>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      </Container>
    )
  }

  if (!detail) {
    return (
      <Container>
        <div className='alert'>
          <span>Gacha pack not found.</span>
        </div>
      </Container>
    )
  }

  const availableCards = cards
    .filter((card) => !existingCardIds.has(card.id))
    .filter((card) => card.name.toLowerCase().includes(cardFilter.toLowerCase()));

  return (
    <Container>
      <div>
        <div className='mb-6 flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold'>{detail.name}</h1>
            <PackSummary pack={detail} />
          </div>
          <Button onClick={() => setIsAddOpen(true)}>Add Cards</Button>
        </div>

        <GachaPackListingControls
          pack={detail}
          saving={updating}
          onSave={handleSaveListing}
        />

        <GachaPackPityRules
          rules={pityRules}
          rarities={rarities}
          saving={pityLoading}
          onCreate={handleCreatePityRule}
          onDelete={handleDeletePityRule}
        />

        <div className='card bg-base-200 shadow-sm'>
          <div className='card-body gap-4'>
            <h2 className='card-title text-lg'>Pack contents</h2>
            <GachaPackCardTable
              cards={packCards}
              featuredCardId={detail.featuredCard?.id ?? null}
            />
          </div>
        </div>

        <Modal
          title="Add Cards to Gacha Pack"
          isOpen={isAddOpen}
          onClose={closeAddModal}
          footer={(
            <>
              <Button variant='ghost' onClick={closeAddModal}>Cancel</Button>
              <Button onClick={handleAddCards}>Add</Button>
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
                {availableCards.map((card) => (
                  <label key={card.id} className='flex items-center gap-2 py-1'>
                    <input
                      type='checkbox'
                      className='checkbox'
                      checked={selectedCardIds.includes(card.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCardIds((s) => Array.from(new Set([...s, card.id])));
                        else setSelectedCardIds((s) => s.filter(x => x !== card.id));
                      }}
                    />
                    <span>{card.name}</span>
                  </label>
                ))}
                {availableCards.length === 0 && (
                  <div className='text-sm text-content-400'>No cards match the filter or all cards are already added.</div>
                )}
              </div>
            </label>
            <label className='flex flex-col'>
              <span className='text-sm'>Weight</span>
              <input className='input input-bordered' type='number' min={1} value={weight} onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))} />
            </label>
          </div>
        </Modal>
        <ToastContainer />
      </div>
    </Container>
  )
}

export default GachaPackDetails
