import { Suspense, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Container from '../components/Container';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGachaPacksDetail, fetchGachaPackById, updateGachaPack } from '../features/cards/gachaPackSlice';
import { fetchAssets } from '../features/assets/assetsSlice';
import { fetchCards } from '../features/cards/cardSlice';
import { addGachaPackCard } from '../features/cards/gachaPackCardSlice';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import { useToast } from '../hooks/useToast';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';
import { LoadingFallback } from '../components/LoadingFallback';
import type { GachaPackDetail as GachaPackDetailType, GachaPack as GachaPackType } from '../features/cards/gachaPackSlice';
import { uploadAssetWithPresigned } from '../helpers/uploadAsset';
import { ASSET_TYPE } from '../helpers/assetTypes';
import { ErrorBoundary } from 'react-error-boundary';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type ToastFn = (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;

function isVideoUrl(url: string | null | undefined, kind?: string | null): boolean {
  if (kind) return kind === 'video';
  if (!url) return false;
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

function SlotPreview({ url, kind }: { url: string | null | undefined; kind?: string | null }) {
  if (!url) return <div className="text-sm text-base-content/50">None</div>;
  if (isVideoUrl(url, kind)) {
    return <video src={url} controls className="max-h-40 rounded" />;
  }
  return <img src={url} alt="Slot preview" className="max-h-40 rounded" />;
}

type AssetPickerModalProps = {
  isOpen: boolean;
  title: string;
  // Exact asset_type_id values the backend accepts for this slot
  // (gachaDAO.assertAssetOfType: banner=10, trailer=11).
  allowedTypeIds: readonly number[];
  onPick: (assetId: number) => void;
  onClose: () => void;
};

function AssetPickerModal({ isOpen, title, allowedTypeIds, onPick, onClose }: AssetPickerModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const assets = useSelector((state: RootState) => state.assets.data);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && assets.length === 0) {
      void dispatch(fetchAssets());
    }
  }, [dispatch, isOpen, assets.length]);

  useEffect(() => {
    if (!isOpen) setSelected(null);
  }, [isOpen]);

  const eligible = assets.filter((a) => allowedTypeIds.includes(a.asset_type_id));

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} footer={(
      <>
        <Button variant='ghost' onClick={onClose}>Cancel</Button>
        <Button
          disabled={selected === null}
          onClick={() => { if (selected !== null) { onPick(selected); setSelected(null); } }}
        >Confirm</Button>
      </>
    )}>
      <div className="border rounded p-2 max-h-64 overflow-y-auto">
        {eligible.length === 0 && <div className="text-sm text-base-content/50">No existing assets match the required asset type.</div>}
        {eligible.map((a) => (
          <label key={a.id} className='flex items-center gap-2 py-1'>
            <input
              type='radio'
              name='asset-option'
              className='radio'
              checked={selected === a.id}
              onChange={() => setSelected(a.id)}
            />
            <span>#{a.id} <span className="text-xs text-base-content/50">{a.assets_url}</span></span>
          </label>
        ))}
      </div>
    </Modal>
  );
}

type SlotUploaderProps = {
  label: string;
  accept: string;
  slot: 'banner' | 'trailer';
  currentUrl: string | null | undefined;
  currentKind?: string | null;
  showToast: ToastFn;
  onPickAsset: (assetId: number) => Promise<void>;
  onClear: () => Promise<void>;
  allowedTypeIds: readonly number[];
  pickerTitle: string;
};

function SlotUploader({ label, accept, slot, currentUrl, currentKind, showToast, onPickAsset, onClear, allowedTypeIds, pickerTitle }: SlotUploaderProps) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    // The backend (gachaDAO.assertAssetOfType) requires an exact per-slot
    // asset type: banner assets must be GACHA_BANNER_ARTWORK (10) and trailer
    // assets must be GACHA_TRAILER_VIDEO (11). Only the matching MIME class
    // can be uploaded into each slot; anything else is rejected here so we
    // never orphan an upload the backend will refuse to attach.
    let assetTypeId: number;
    if (file.type.startsWith('image/')) {
      if (slot !== 'banner') {
        showToast('Image trailers are not supported — the trailer slot only accepts video files', 'error');
        return;
      }
      assetTypeId = ASSET_TYPE.GACHA_BANNER_ARTWORK;
    } else if (file.type.startsWith('video/')) {
      if (slot !== 'trailer') {
        showToast('Banner slot only accepts images', 'error');
        return;
      }
      assetTypeId = ASSET_TYPE.GACHA_TRAILER_VIDEO;
    } else {
      showToast('Unsupported file type', 'error');
      return;
    }
    setStatus('uploading');
    try {
      const asset = await uploadAssetWithPresigned(file, undefined, undefined, assetTypeId);
      await onPickAsset(asset.id);
      setStatus('success');
      showToast(`${label} updated`, 'success');
    } catch (err: unknown) {
      setStatus('error');
      if (axios.isAxiosError(err)) {
        showToast(err.response?.data?.message || `${label} upload failed`, 'error');
      } else if (err instanceof Error) {
        showToast(err.message, 'error');
      } else {
        showToast(`${label} upload failed`, 'error');
      }
    }
  };

  return (
    <div className='mb-6 border rounded p-4'>
      <div className='font-semibold mb-2'>{label}</div>
      <div className='flex items-start gap-4'>
        <div className='flex-1'>
          <SlotPreview url={currentUrl} kind={currentKind} />
        </div>
        <div className='flex flex-col gap-2 items-stretch'>
          <label className='flex flex-col'>
            <span className='text-sm'>Upload new</span>
            <input
              type='file'
              accept={accept}
              className='file-input file-input-bordered file-input-sm my-1'
              disabled={status === 'uploading'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                void handleFile(file);
              }}
            />
          </label>
          <Button size='sm' variant='info' onClick={() => setIsPickerOpen(true)}>Pick existing asset</Button>
          <Button size='sm' variant='error' disabled={currentUrl == null || status === 'uploading'} onClick={() => { void onClear(); }}>Clear</Button>
          {status === 'uploading' && <span className='text-sm text-base-content/60'>Uploading…</span>}
        </div>
      </div>
      <AssetPickerModal
        isOpen={isPickerOpen}
        title={pickerTitle}
        allowedTypeIds={allowedTypeIds}
        onClose={() => setIsPickerOpen(false)}
        onPick={(assetId) => { setIsPickerOpen(false); void onPickAsset(assetId); }}
      />
    </div>
  );
}

function PackKeyArt({ packId, pack, showToast }: { packId: number; pack: GachaPackType; showToast: ToastFn }) {
  const dispatch = useDispatch<AppDispatch>();

  // Feature-flag style: the API returns `bannerAsset`/`trailerAsset` fields on
  // every pack payload. `null` means "empty slot" (section must render so the
  // first key art can be attached); `undefined` means the field is genuinely
  // absent from the payload (legacy deployment) — hide gracefully then.
  if (pack.bannerAsset === undefined && pack.trailerAsset === undefined) return null;

  const patchSlot = async (field: 'bannerAssetId' | 'trailerAssetId', value: number | null) => {
    try {
      await dispatch(updateGachaPack({ id: packId, [field]: value })).unwrap();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        showToast(err.response?.data?.message || 'Failed to update gacha pack', 'error');
      } else if (err instanceof Error) {
        showToast(err.message, 'error');
      } else {
        showToast('Failed to update gacha pack', 'error');
      }
    }
  };

  return (
    <section className='mb-6'>
      <h2 className='font-bold text-lg mb-2'>Pack Key Art</h2>
      <SlotUploader
        label='Banner'
        accept='image/*'
        slot='banner'
        currentUrl={pack.bannerAsset?.url ?? null}
        currentKind='image'
        showToast={showToast}
        allowedTypeIds={[ASSET_TYPE.GACHA_BANNER_ARTWORK]}
        pickerTitle='Pick banner image asset'
        onPickAsset={(assetId) => patchSlot('bannerAssetId', assetId)}
        onClear={() => patchSlot('bannerAssetId', null)}
      />
      <SlotUploader
        label='Trailer'
        accept='video/*'
        slot='trailer'
        currentUrl={pack.trailerAsset?.url ?? null}
        currentKind={pack.trailerAsset?.kind ?? null}
        showToast={showToast}
        allowedTypeIds={[ASSET_TYPE.GACHA_TRAILER_VIDEO]}
        pickerTitle='Pick trailer video asset'
        onPickAsset={(assetId) => patchSlot('trailerAssetId', assetId)}
        onClear={() => patchSlot('trailerAssetId', null)}
      />
    </section>
  );
}




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
  const { details: gachaPackDetails = [], detailsLoading, packLoading, error, pack: gachaPack } = useSelector((state: RootState) => state.gachaPack);
  const loading = detailsLoading || packLoading;
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
        {gachaPack && (
          <PackKeyArt packId={gachaPack.id} pack={gachaPack} showToast={showToast} />
        )}
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
                const finalWeight = Math.max(1, weight);
                if (finalWeight !== weight) {
                  setWeight(finalWeight);
                }
                const payload = {
                  gachaPackId: Number(id),
                  cardId: selectedCardIds.map((s) => Number(s)),
                  weight: finalWeight,
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