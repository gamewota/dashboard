import { useState } from 'react';
import { Button } from './Button';
import Modal from './Modal';
import { DataTable } from './DataTable';
import type { RarityType } from '../features/cards/raritySlice';
import type { GachaPackPityRule } from '../lib/schemas/gachaPack';

type GachaPackPityRulesProps = {
  rules: GachaPackPityRule[];
  rarities: RarityType[];
  saving?: boolean;
  onCreate: (rule: GachaPackPityRule) => void;
  onDelete: (rule: GachaPackPityRule) => void;
};

/**
 * Pity-rule management for a pack. The API has no per-rule DELETE, so removing a
 * rule is handled upstream by PATCHing the remaining set.
 */
export function GachaPackPityRules({
  rules,
  rarities,
  saving = false,
  onCreate,
  onDelete,
}: GachaPackPityRulesProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [triggerCount, setTriggerCount] = useState('10');
  const [guaranteedRarityId, setGuaranteedRarityId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GachaPackPityRule | null>(null);

  const rarityNameById = new Map(rarities.map((rarity) => [rarity.id, rarity.name]));

  const resetForm = () => {
    setTriggerCount('10');
    setGuaranteedRarityId('');
    setFormError(null);
  };

  const closeCreate = () => {
    setIsCreateOpen(false);
    resetForm();
  };

  const handleCreate = () => {
    const parsedTrigger = Number(triggerCount);
    if (!Number.isInteger(parsedTrigger) || parsedTrigger < 1) {
      setFormError('Trigger count must be a whole number of at least 1.');
      return;
    }
    if (!guaranteedRarityId) {
      setFormError('Select the rarity this rule guarantees.');
      return;
    }
    if (rules.some((rule) => rule.triggerCount === parsedTrigger)) {
      setFormError(`A rule for ${parsedTrigger} pulls already exists.`);
      return;
    }

    onCreate({
      triggerCount: parsedTrigger,
      guaranteedRarityId: Number(guaranteedRarityId),
    });
    closeCreate();
  };

  const columns = [
    { header: 'Trigger (pulls)', accessor: (row: GachaPackPityRule) => row.triggerCount },
    {
      header: 'Guaranteed rarity',
      accessor: (row: GachaPackPityRule) =>
        rarityNameById.get(row.guaranteedRarityId) ?? `Rarity ${row.guaranteedRarityId}`,
    },
    {
      header: 'Actions',
      accessor: (row: GachaPackPityRule) => (
        <Button size='xs' variant='error' disabled={saving} onClick={() => setPendingDelete(row)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className='card bg-base-200 shadow-sm mb-6'>
      <div className='card-body gap-4'>
        <div className='flex items-center justify-between'>
          <h2 className='card-title text-lg'>Pity rules</h2>
          <Button size='sm' onClick={() => setIsCreateOpen(true)} disabled={saving}>
            Add rule
          </Button>
        </div>

        {rules.length === 0 ? (
          <div className='alert alert-warning'>
            <div>
              <span className='font-semibold'>This pack has no pity rules.</span>
              <p className='text-sm mt-1'>
                Without at least one pity rule the pack can&apos;t be pulled. Add a rule to make it
                playable.
              </p>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rules}
            rowKey={(row) => row.triggerCount}
            emptyMessage='No pity rules configured.'
          />
        )}
      </div>

      <Modal
        title='Add pity rule'
        isOpen={isCreateOpen}
        onClose={closeCreate}
        footer={
          <>
            <Button variant='ghost' onClick={closeCreate}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Adding...' : 'Add rule'}
            </Button>
          </>
        }
      >
        <div className='grid gap-3'>
          <label className='flex flex-col'>
            <span className='text-sm'>Trigger count</span>
            <input
              type='number'
              min={1}
              className='input input-bordered'
              value={triggerCount}
              onChange={(e) => setTriggerCount(e.target.value)}
            />
            <span className='text-xs text-content-400 mt-1'>
              Pulls without the target rarity before the guarantee fires.
            </span>
          </label>

          <label className='flex flex-col'>
            <span className='text-sm'>Guaranteed rarity</span>
            <select
              className='select select-bordered'
              value={guaranteedRarityId}
              onChange={(e) => setGuaranteedRarityId(e.target.value)}
            >
              <option value=''>-- Select rarity --</option>
              {rarities.map((rarity) => (
                <option key={rarity.id} value={String(rarity.id)}>
                  {rarity.name}
                </option>
              ))}
            </select>
          </label>

          {formError && (
            <div className='alert alert-warning py-2'>
              <span className='text-sm'>{formError}</span>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        title='Delete pity rule'
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        footer={
          <>
            <Button variant='ghost' onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant='error'
              disabled={saving}
              onClick={() => {
                if (pendingDelete) onDelete(pendingDelete);
                setPendingDelete(null);
              }}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        {pendingDelete && (
          <p className='text-sm'>
            Delete the rule guaranteeing{' '}
            <span className='font-semibold'>
              {rarityNameById.get(pendingDelete.guaranteedRarityId) ??
                `Rarity ${pendingDelete.guaranteedRarityId}`}
            </span>{' '}
            after <span className='font-semibold'>{pendingDelete.triggerCount}</span> pulls?
            {rules.length === 1 && ' This is the last rule — the pack won’t be pullable.'}
          </p>
        )}
      </Modal>
    </div>
  );
}
