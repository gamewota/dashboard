import { useEffect, useState } from 'react';
import { Button } from './Button';
import {
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from '../helpers/gachaPackFormat';
import {
  FEATURED_CARD_AUTO,
  FEATURED_CARD_MIN_RARITY_ID,
  type GachaPackDetail,
  type GachaPackUpdateInput,
} from '../lib/schemas/gachaPack';

type GachaPackListingControlsProps = {
  pack: GachaPackDetail;
  saving?: boolean;
  onSave: (changes: GachaPackUpdateInput) => void;
};

/**
 * Active-listing controls for a gacha pack: activation toggle, start/end window,
 * sort order and the featured SSR+ card. Only fields the user actually changed
 * are sent, since the PATCH endpoint is a partial update.
 */
export function GachaPackListingControls({
  pack,
  saving = false,
  onSave,
}: GachaPackListingControlsProps) {
  const [isActive, setIsActive] = useState<boolean>(Boolean(pack.isActive));
  const [startAt, setStartAt] = useState<string>(toDateTimeLocalValue(pack.activeStartAt));
  const [endAt, setEndAt] = useState<string>(toDateTimeLocalValue(pack.activeEndAt));
  const [sortOrder, setSortOrder] = useState<string>(String(pack.sortOrder ?? 0));
  const [featuredCardId, setFeaturedCardId] = useState<string>(
    pack.featuredCard ? String(pack.featuredCard.id) : FEATURED_CARD_AUTO,
  );
  const [rangeError, setRangeError] = useState<string | null>(null);

  // Re-sync local form state whenever a save returns fresh server data.
  useEffect(() => {
    setIsActive(Boolean(pack.isActive));
    setStartAt(toDateTimeLocalValue(pack.activeStartAt));
    setEndAt(toDateTimeLocalValue(pack.activeEndAt));
    setSortOrder(String(pack.sortOrder ?? 0));
    setFeaturedCardId(pack.featuredCard ? String(pack.featuredCard.id) : FEATURED_CARD_AUTO);
    setRangeError(null);
  }, [pack]);

  // Only SSR+ cards may be featured.
  const featuredCandidates = pack.cards.filter(
    (card) => card.rarityId >= FEATURED_CARD_MIN_RARITY_ID,
  );

  const handleSave = () => {
    const nextStart = fromDateTimeLocalValue(startAt);
    const nextEnd = fromDateTimeLocalValue(endAt);

    if (nextStart && nextEnd && new Date(nextStart) >= new Date(nextEnd)) {
      setRangeError('The start time must come before the end time.');
      return;
    }
    setRangeError(null);

    const parsedSortOrder = Number(sortOrder);
    if (!Number.isFinite(parsedSortOrder)) {
      setRangeError('Sort order must be a number.');
      return;
    }

    const nextFeaturedId =
      featuredCardId === FEATURED_CARD_AUTO ? null : Number(featuredCardId);
    const currentFeaturedId = pack.featuredCard?.id ?? null;

    const changes: GachaPackUpdateInput = {
      ...(isActive !== Boolean(pack.isActive) ? { isActive } : {}),
      ...(nextStart !== (pack.activeStartAt ?? null) ? { activeStartAt: nextStart } : {}),
      ...(nextEnd !== (pack.activeEndAt ?? null) ? { activeEndAt: nextEnd } : {}),
      ...(parsedSortOrder !== (pack.sortOrder ?? 0) ? { sortOrder: parsedSortOrder } : {}),
      ...(nextFeaturedId !== currentFeaturedId ? { featuredCardId: nextFeaturedId } : {}),
    };

    onSave(changes);
  };

  return (
    <div className='card bg-base-200 shadow-sm mb-6'>
      <div className='card-body gap-4'>
        <h2 className='card-title text-lg'>Listing</h2>

        <label className='flex items-center gap-3'>
          <input
            type='checkbox'
            className='toggle toggle-success'
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span className='text-sm'>
            {isActive ? 'Active — visible in the app' : 'Inactive — hidden from the app'}
          </span>
        </label>

        <div className='grid gap-4 md:grid-cols-2'>
          <label className='flex flex-col'>
            <span className='text-sm'>Active from</span>
            <input
              type='datetime-local'
              className='input input-bordered'
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </label>
          <label className='flex flex-col'>
            <span className='text-sm'>Active until</span>
            <input
              type='datetime-local'
              className='input input-bordered'
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
          </label>
        </div>
        <p className='text-xs text-content-400 -mt-2'>
          Leave both blank for a pack that is always listed while active.
        </p>

        <div className='grid gap-4 md:grid-cols-2'>
          <label className='flex flex-col'>
            <span className='text-sm'>Sort order</span>
            <input
              type='number'
              className='input input-bordered'
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
            <span className='text-xs text-content-400 mt-1'>Lower numbers appear first.</span>
          </label>

          <label className='flex flex-col'>
            <span className='text-sm'>Featured card</span>
            <select
              className='select select-bordered'
              value={featuredCardId}
              onChange={(e) => setFeaturedCardId(e.target.value)}
            >
              <option value={FEATURED_CARD_AUTO}>Auto (rarest)</option>
              {featuredCandidates.map((card) => (
                <option key={card.id} value={String(card.id)}>
                  {card.name} ({card.rarityName})
                </option>
              ))}
            </select>
            <span className='text-xs text-content-400 mt-1'>
              {featuredCandidates.length === 0
                ? 'This pack has no SSR+ cards to feature yet.'
                : 'Only SSR and above can be featured.'}
            </span>
          </label>
        </div>

        {rangeError && (
          <div className='alert alert-warning py-2'>
            <span className='text-sm'>{rangeError}</span>
          </div>
        )}

        <div className='card-actions justify-end'>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save listing'}
          </Button>
        </div>
      </div>
    </div>
  );
}
