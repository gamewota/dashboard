import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../store';
import { addCard, type CardPayload } from '../features/cards/cardSlice';
import { fetchRarities, selectRarities } from '../features/cards/raritySlice';
import { fetchCardVariants, selectCardVariants } from '../features/cards/cardVariantSlice';
import { fetchElements, selectElements } from '../features/elements/elementSlice';
import { fetchMembers, selectMembers, type MemberType } from '../features/members/membersSlice';
import { uploadAssetWithPresigned } from '../helpers/uploadAsset';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddCardModal({ isOpen, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState('');
  const [art, setArt] = useState('');
  const [rarityId, setRarityId] = useState<number | ''>('');
  const [variantId, setVariantId] = useState<number | ''>('');
  const [elementId, setElementId] = useState<number | ''>('');
  const [memberId, setMemberId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rarities = useSelector(selectRarities);
  const variants = useSelector(selectCardVariants);
  const elements = useSelector(selectElements);
  const members = useSelector(selectMembers);
  const [memberQuery, setMemberQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setArt('');
      setRarityId('');
      setVariantId('');
      setElementId('');
      setMemberId('');
      setError(null);
      setLoading(false);
      // fetch related lists via Redux thunks
      dispatch(fetchRarities());
      dispatch(fetchCardVariants());
      dispatch(fetchElements());
      dispatch(fetchMembers());
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError(null);
    setLoading(true);
    const payload: CardPayload = {
      name,
      rarity_id: typeof rarityId === 'number' ? rarityId : Number(rarityId) || 0,
      cards_variant_id: typeof variantId === 'number' ? variantId : Number(variantId) || 0,
      art,
      element: typeof elementId === 'number' ? elementId : Number(elementId) || 0,
      member: typeof memberId === 'number' ? memberId : Number(memberId) || 0,
    };

    try {
      await dispatch(addCard(payload)).unwrap();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add card');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const asset = await uploadAssetWithPresigned(file);
      const url = asset.assets_url;
      if (!url) throw new Error('Upload succeeded but no asset URL returned');
      setArt(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload asset');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold mb-4">Add Card</h2>

        <div className="grid grid-cols-1 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Card name"
            className="input input-bordered w-full"
          />

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              className="file-input file-input-bordered w-full"
            />
            {uploading ? <span className="text-sm">Uploading...</span> : art ? <img src={art} alt="preview" className="w-12 h-12 object-cover rounded" /> : null}
          </div>

          <label className="block">
            <span className="label-text">Rarity</span>
            <select
              value={rarityId}
              onChange={(e) => setRarityId(e.target.value === '' ? '' : Number(e.target.value))}
              className="select select-bordered w-full"
            >
              <option value="">Select rarity</option>
              {rarities.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="label-text">Variant</span>
            <select
              value={variantId}
              onChange={(e) => setVariantId(e.target.value === '' ? '' : Number(e.target.value))}
              className="select select-bordered w-full"
            >
              <option value="">Select variant</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>{v.variant_name ?? v.variant_value ?? v.id}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="label-text">Element</span>
            <select
              value={elementId}
              onChange={(e) => setElementId(e.target.value === '' ? '' : Number(e.target.value))}
              className="select select-bordered w-full"
            >
              <option value="">Select element</option>
              {elements.map((el) => (
                <option key={el.id} value={el.id}>{el.name ?? el.id}</option>
              ))}
            </select>
          </label>

          <label className="block relative">
            <span className="label-text">Member</span>
            <input
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              placeholder="Search member by name"
              className="input input-bordered w-full"
            />
            <input type="hidden" value={String(memberId)} />
            {memberQuery && (
              <ul className="absolute left-0 right-0 bg-base-100 border rounded mt-1 max-h-40 overflow-auto z-20">
                {members
                  .filter((m: MemberType) => (m.member_name ?? '').toLowerCase().includes(memberQuery.toLowerCase()))
                  .map((m: MemberType) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-base-200"
                        onClick={() => {
                          setMemberId(m.id);
                          setMemberQuery(m.member_name ?? String(m.id));
                        }}
                      >
                        {m.member_name ?? m.name ?? m.id}
                      </button>
                    </li>
                  ))}
                {members.filter((m: MemberType) => (m.member_name ?? '').toLowerCase().includes(memberQuery.toLowerCase())).length === 0 && (
                  <li className="px-3 py-2 text-sm text-gray-400">No members found</li>
                )}
              </ul>
            )}
            <div className="text-xs text-gray-500 mt-1">Selected ID: {memberId || '—'}</div>
          </label>
        </div>

        {error && <p className="text-sm text-error mt-2">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddCardModal;
