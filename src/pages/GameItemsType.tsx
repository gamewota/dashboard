import Container from '../components/Container'
import { DataTable } from '../components/DataTable';
import { useEffect, useState } from 'react';

// Local game items type (matches slice)
type GameItemsType = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

import { useDispatch, useSelector } from 'react-redux';
import { fetchGameItemsTypes, createGameItemsType, updateGameItemsType, deleteGameItemsType } from '../features/gameItemsType/gameItemsTypeSlice';
import type { RootState, AppDispatch } from '../store';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import Modal from '../components/Modal';

const GameItemsType = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: gameItemsTypes = [], loading, error } = useSelector((state: RootState) => state.gameItemsTypes);
  const { showToast, ToastContainer } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<GameItemsType | null>(null);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);


  useEffect(() => {
      dispatch(fetchGameItemsTypes());
    }, [dispatch]);

    const openEdit = (t: GameItemsType) => {
      setEditing(t);
      setEditForm({ name: t.name, description: t.description || '' });
      setIsEditOpen(true);
    };
    const openDelete = (id: number) => {
      setDeletingId(id);
      setIsDeleteOpen(true);
    };

    const handleCreate = async () => {
      try {
        const result = await dispatch(createGameItemsType({ name: createForm.name, description: createForm.description })).unwrap();
        const resp = result as unknown;
        let msg: string | undefined;
        if (resp && typeof resp === 'object' && 'message' in resp) {
          const r = resp as Record<string, unknown>;
          if (typeof r.message === 'string') msg = r.message;
        }
        showToast(msg || 'Created', 'success');
        dispatch(fetchGameItemsTypes());
        setIsCreateOpen(false);
        setCreateForm({ name: '', description: '' });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        showToast(message || 'Failed to create', 'error');
      }
    };

    const handleEdit = async () => {
      if (!editing) return;
      try {
        const result = await dispatch(updateGameItemsType({ id: editing.id, name: editForm.name, description: editForm.description })).unwrap();
        const resp = result as unknown;
        let msg: string | undefined;
        if (resp && typeof resp === 'object' && 'message' in resp) {
          const r = resp as Record<string, unknown>;
          if (typeof r.message === 'string') msg = r.message;
        }
        showToast(msg || 'Updated', 'success');
        dispatch(fetchGameItemsTypes());
        setIsEditOpen(false);
        setEditing(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        showToast(message || 'Failed to update', 'error');
      }
    };

    const handleDelete = async () => {
      if (deletingId == null) return;
      try {
        const result = await dispatch(deleteGameItemsType(deletingId)).unwrap();
        const resp = result as unknown;
        let msg: string | undefined;
        if (resp && typeof resp === 'object' && 'message' in resp) {
          const r = resp as Record<string, unknown>;
          if (typeof r.message === 'string') msg = r.message;
        }
        showToast(msg || 'Deleted', 'success');
        // delete reducer already removed from state; ensure list is fresh
        dispatch(fetchGameItemsTypes());
        setIsDeleteOpen(false);
        setDeletingId(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        showToast(message || 'Failed to delete', 'error');
      }
    };

  return (
    <Container>
      {loading && (
        <div className='flex items-center'>
          <span className="loading loading-spinner" />
          <span className="ml-2">Loading game items types...</span>
        </div>
      )}

      {error && (
        <div className='text-error'>Error: {error}</div>
      )}


      <div className='overflow-x-auto'>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Game Items Types</h1>
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>Add Type</Button>
        </div>
        <DataTable<GameItemsType>
          columns={[
            { header: '#', accessor: (_row: GameItemsType, i: number) => i + 1 },
            { header: 'Name', accessor: 'name' as keyof GameItemsType },
            { header: 'Description', accessor: (row: GameItemsType) => row.description || '-' },
            { header: 'Created At', accessor: (row: GameItemsType) => row.created_at || '-' },
            { header: 'Updated At', accessor: (row: GameItemsType) => row.updated_at || '-' },
            { header: 'Actions', accessor: (row: GameItemsType) => (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>Edit</Button>
                <Button size="sm" variant="error" onClick={() => openDelete(row.id)}>Delete</Button>
              </div>
            )},
          ]}
          data={gameItemsTypes as GameItemsType[]}
          rowKey={'id'}
          loading={loading}
          error={error}
          emptyMessage={'No Game Items Types found.'}
        />

        {/* Create Modal */}
        <Modal
          id="create_game_item_type"
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create Game Item Type"
          footer={
            <>
              <Button onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreate}>Create</Button>
            </>
          }
        >
          <div className="space-y-2">
            <input className="input input-bordered w-full" placeholder="Name" value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} />
            <textarea className="textarea textarea-bordered w-full" placeholder="Description" value={createForm.description} onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          id="edit_game_item_type"
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={editing ? `Edit: ${editing.name}` : 'Edit Game Item Type'}
          footer={
            <>
              <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleEdit}>Save</Button>
            </>
          }
        >
          <div className="space-y-2">
            <input className="input input-bordered w-full" placeholder="Name" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
            <textarea className="textarea textarea-bordered w-full" placeholder="Description" value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
        </Modal>

        {/* Delete confirmation */}
        <Modal
          id="delete_game_item_type"
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title={`Are you sure you want to delete this type?`}
          footer={
            <>
              <Button onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="error" onClick={handleDelete}>Delete</Button>
            </>
          }
        />
      </div>
      <ToastContainer />
    </Container>
  )
}

export default GameItemsType