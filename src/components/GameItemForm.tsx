import React from 'react';

export type GameItemFormState = {
  name: string;
  description: string;
  tier: number;
  // keep these present but allow undefined to match callers that set them explicitly to undefined
  element_id: number | undefined;
  game_items_type_id: number | undefined;
  assetFile: File | undefined;
};

export type GameItemType = { id: number; name: string };
export type ElementType = { id: number; name: string };

type Props = {
  form: GameItemFormState;
  setForm: React.Dispatch<React.SetStateAction<GameItemFormState>>;
  gameItemsTypes: GameItemType[];
  elements: ElementType[];
  idPrefix?: string; // e.g. 'create' or 'edit'
  currentAssetUrl?: string | null;
};

export function GameItemForm({ form, setForm, gameItemsTypes, elements, idPrefix = 'form', currentAssetUrl }: Props) {
  const p = (name: string) => `${idPrefix}-${name}`;

  return (
    <div className="space-y-2">
      {/* show current thumbnail when available (edit mode) */}
      {currentAssetUrl && (
        <div className="flex items-center gap-4">
          <img src={currentAssetUrl} alt="Current asset thumbnail" className="w-24 h-24 object-cover rounded" />
          <div className="text-sm text-muted">Current image</div>
        </div>
      )}
      <label htmlFor={p('name')} className="label"><span className="label-text">Name</span></label>
      <input id={p('name')} className="input input-bordered w-full" placeholder="Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />

      <label htmlFor={p('description')} className="label"><span className="label-text">Description</span></label>
      <textarea id={p('description')} className="textarea textarea-bordered w-full" placeholder="Description" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />

      <label htmlFor={p('tier')} className="label"><span className="label-text">Tier</span></label>
      <input id={p('tier')} type="number" className="input input-bordered w-full" placeholder="Tier" value={form.tier} min={1} max={3} step={1} onChange={(e) => setForm((s) => ({ ...s, tier: Number(e.target.value) }))} />

      <label htmlFor={p('type')} className="label"><span className="label-text">Game Item Type</span></label>
      <select id={p('type')} className="select select-bordered w-full" value={form.game_items_type_id ?? ''} onChange={(e) => setForm((s) => ({ ...s, game_items_type_id: e.target.value ? Number(e.target.value) : undefined }))}>
        <option value="">Select Type</option>
        {gameItemsTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <label htmlFor={p('element')} className="label"><span className="label-text">Element</span></label>
      <select id={p('element')} className="select select-bordered w-full" value={form.element_id ?? ''} onChange={(e) => setForm((s) => ({ ...s, element_id: e.target.value ? Number(e.target.value) : undefined }))}>
        <option value="">Select Element</option>
        {elements.map((el) => <option key={el.id} value={el.id}>{el.name}</option>)}
      </select>

      <label htmlFor={p('asset')} className="label"><span className="label-text">Image (PNG/JPEG)</span></label>
      <input id={p('asset')} type="file" accept="image/*" onChange={(e) => setForm((s) => ({ ...s, assetFile: e.target.files?.[0] }))} />
    </div>
  );
}

export default GameItemForm;
