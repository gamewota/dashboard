import Container from '../components/Container'
import { DataTable } from '../components/DataTable';

// Local game items type (matches slice)
type GameItems = {
  id: number;
  name: string;
  description: string;
  tier: number;
  asset_id: number;
  element_id: number;
  game_items_type_id: number;
  created_at: string;
  updated_at: string;
};
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../helpers/constants';
import { getAuthHeader } from '../helpers/getAuthHeader';
import { fetchGameItems, createGameItem, updateGameItem, deleteGameItem } from '../features/gameItems/gameItemsSlice';
import { fetchGameItemsTypes } from '../features/gameItemsType/gameItemsTypeSlice';
import { fetchElements } from '../features/elements/elementSlice';
import type { RootState, AppDispatch } from '../store';
import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import GameItemForm from '../components/GameItemForm';

const GameItems = () => {
  const dispatch = useDispatch<AppDispatch>();
  const gameItems = useSelector((state: RootState) => state.gameItems.data ?? []);
  const loading = useSelector((state: RootState) => state.gameItems.loading);
  const error = useSelector((state: RootState) => state.gameItems.error);


  useEffect(() => {
      dispatch(fetchGameItems());
    }, [dispatch]);

  // fetch supporting data for selects
  useEffect(() => {
    dispatch(fetchGameItemsTypes());
    dispatch(fetchElements());
  }, [dispatch]);

  const { showToast, ToastContainer } = useToast();

  const { data: gameItemsTypes = [] } = useSelector((s: RootState) => s.gameItemsTypes);
  const { data: elements = [] } = useSelector((s: RootState) => s.elements);
  // current asset preview URL for edit modal (fetched from backend per-request)
  const [currentAssetUrl, setCurrentAssetUrl] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<GameItems | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [createForm, setCreateForm] = useState({ name: '', description: '', tier: 1, element_id: undefined as number | undefined, game_items_type_id: undefined as number | undefined, assetFile: undefined as File | undefined });
  const [editForm, setEditForm] = useState({ name: '', description: '', tier: 1, element_id: undefined as number | undefined, game_items_type_id: undefined as number | undefined, assetFile: undefined as File | undefined });

  const openEdit = async (item: GameItems) => {
    setEditing(item);
    setEditForm({ name: item.name, description: item.description, tier: item.tier, element_id: item.element_id, game_items_type_id: item.game_items_type_id, assetFile: undefined });
    // fetch asset details from backend using provided endpoint if asset_id exists
    if (item.asset_id) {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/assets/${item.asset_id}`, { headers: getAuthHeader() });
        setCurrentAssetUrl(data?.assets_url ?? null);
      } catch {
        setCurrentAssetUrl(null);
      }
    } else {
      setCurrentAssetUrl(null);
    }
    setIsEditOpen(true);
  };

  const openDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleCreate = async () => {
    try {
      const tier = Math.min(3, Math.max(1, Number(createForm.tier)));
      const payload = {
        name: createForm.name,
        description: createForm.description,
        tier,
        element_id: createForm.element_id,
        game_items_type_id: createForm.game_items_type_id,
        assetFile: createForm.assetFile,
      } as const;

      const result = await dispatch(createGameItem(payload)).unwrap();
      const resp = result as unknown;
      let msg: string | undefined;
      if (resp && typeof resp === 'object' && 'message' in resp) {
        const r = resp as Record<string, unknown>;
        if (typeof r.message === 'string') msg = r.message;
      }
      showToast(msg || 'Created', 'success');
      dispatch(fetchGameItems());
      setIsCreateOpen(false);
      setCreateForm({ name: '', description: '', tier: 1, element_id: undefined, game_items_type_id: undefined, assetFile: undefined });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(message || 'Failed to create', 'error');
    }
  };

  const handleEdit = async () => {
    if (!editing) return;
    try {
      const tier = Math.min(3, Math.max(1, Number(editForm.tier)));
      const payload = {
        id: editing.id,
        name: editForm.name,
        description: editForm.description,
        tier,
        element_id: editForm.element_id,
        game_items_type_id: editForm.game_items_type_id,
        assetFile: editForm.assetFile,
      } as const;

      const result = await dispatch(updateGameItem(payload)).unwrap();
      const resp = result as unknown;
      let msg: string | undefined;
      if (resp && typeof resp === 'object' && 'message' in resp) {
        const r = resp as Record<string, unknown>;
        if (typeof r.message === 'string') msg = r.message;
      }
      showToast(msg || 'Updated', 'success');
      dispatch(fetchGameItems());
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
      const result = await dispatch(deleteGameItem(deletingId)).unwrap();
      const resp = result as unknown;
      let msg: string | undefined;
      if (resp && typeof resp === 'object' && 'message' in resp) {
        const r = resp as Record<string, unknown>;
        if (typeof r.message === 'string') msg = r.message;
      }
      showToast(msg || 'Deleted', 'success');
      dispatch(fetchGameItems());
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
          <span className="ml-2">Loading game items...</span>
        </div>
      )}

      {error && (
        <div className='text-error'>Error: {error}</div>
      )}


      <div className='overflow-x-auto'>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Game Items</h1>
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>Add Item</Button>
        </div>
        <DataTable<GameItems>
          columns={[
            { header: '#', accessor: (_row: GameItems, i: number) => i + 1 },
            { header: 'Name', accessor: 'name' as keyof GameItems },
            { header: 'Description', accessor: (row: GameItems) => row.description || '-' },
            { header: 'Tier', accessor: (row: GameItems) => row.tier || '-' },
            { header: 'Asset ID', accessor: (row: GameItems) => row.asset_id || '-' },
            { header: 'Element', accessor: (row: GameItems) => row.element_id || '-' },
            { header: 'Game Items Type', accessor: (row: GameItems) => row.game_items_type_id || '-' },
            { header: 'Created At', accessor: (row: GameItems) => row.created_at || '-' },
            { header: 'Updated At', accessor: (row: GameItems) => row.updated_at || '-' },
            { header: 'Actions', accessor: (row: GameItems) => (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>Edit</Button>
                <Button size="sm" variant="error" onClick={() => openDelete(row.id)}>Delete</Button>
              </div>
            )},
          ]}
          data={gameItems as GameItems[]}
          rowKey={'id'}
          loading={loading}
          error={error}
          emptyMessage={'No Game Items found.'}
        />
      </div>

      {/* Create Modal */}
      <Modal
        id="create_game_item"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Game Item"
        footer={<>
          <Button onClick={() => setIsCreateOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate}>Create</Button>
        </>}
      >
        <GameItemForm form={createForm} setForm={setCreateForm} gameItemsTypes={gameItemsTypes} elements={elements} idPrefix="create" />
      </Modal>

      {/* Edit Modal */}
      <Modal
        id="edit_game_item"
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={editing ? `Edit: ${editing.name}` : 'Edit Game Item'}
        footer={<>
          <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit}>Save</Button>
        </>}
      >
        <GameItemForm
          form={editForm}
          setForm={setEditForm}
          gameItemsTypes={gameItemsTypes}
          elements={elements}
          idPrefix="edit"
          currentAssetUrl={currentAssetUrl}
        />
      </Modal>

      {/* Delete confirmation */}
      <Modal
        id="delete_game_item"
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={`Are you sure you want to delete this item?`}
        footer={<>
          <Button onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
          <Button variant="error" onClick={handleDelete}>Delete</Button>
        </>}
      />

      <ToastContainer />
    </Container>
  )
}

export default GameItems