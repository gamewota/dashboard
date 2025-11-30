import Container from '../components/Container'
import { DataTable } from '../components/DataTable';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import type { NewsTypeItem } from '../features/newsType/newsTypeSlice';
import { createNewsType, fetchNewsTypes, updateNewsType, deleteNewsType } from '../features/newsType/newsTypeSlice';
import Modal from '../components/Modal';
import { useHasPermission } from '../hooks/usePermissions';



const NewsType = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data: newsTypes = [], loading, error } = useSelector((state: RootState) => state.newsTypes);
      const [isCreateOpen, setIsCreateOpen] = useState(false);
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);
      const [editing, setEditing] = useState<NewsTypeItem | null>(null);
      const [createForm, setCreateForm] = useState({ name: '', description: '' });
      const [editForm, setEditForm] = useState({ name: '', description: '' });
      const [deletingId, setDeletingId] = useState<number | null>(null);
      const canCreateNewsType = useHasPermission('news_type.create');
      const canEditNewsType = useHasPermission('news_type.edit');
      const canDeleteNewsType = useHasPermission('news_type.delete');

    useEffect(() => {
        dispatch(fetchNewsTypes());
    }, [dispatch]);

    const { showToast, ToastContainer } = useToast();

    const openEdit = (t: NewsTypeItem) => {
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
        const result = await dispatch(createNewsType({ name: createForm.name, description: createForm.description })).unwrap();
        const resp = result as unknown;
        let msg: string | undefined;
        if (resp && typeof resp === 'object' && 'message' in resp) {
            const r = resp as Record<string, unknown>;
            if (typeof r.message === 'string') msg = r.message;
        }
        showToast(msg || 'Created', 'success');
        dispatch(fetchNewsTypes());
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
        const result = await dispatch(updateNewsType({ id: editing.id, name: editForm.name, description: editForm.description })).unwrap();
        const resp = result as unknown;
        let msg: string | undefined;
        if (resp && typeof resp === 'object' && 'message' in resp) {
            const r = resp as Record<string, unknown>;
            if (typeof r.message === 'string') msg = r.message;
        }
        showToast(msg || 'Updated', 'success');
        dispatch(fetchNewsTypes());
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
        const result = await dispatch(deleteNewsType(deletingId)).unwrap();
        const resp = result as unknown;
        let msg: string | undefined;
        if (resp && typeof resp === 'object' && 'message' in resp) {
            const r = resp as Record<string, unknown>;
            if (typeof r.message === 'string') msg = r.message;
        }
        showToast(msg || 'Deleted', 'success');
        // delete reducer already removed from state; ensure list is fresh
        dispatch(fetchNewsTypes());
        setIsDeleteOpen(false);
        setDeletingId(null);
        } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        showToast(message || 'Failed to delete', 'error');
        }
    };

  return (
    <Container>

        <div className="overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">News Types</h1>
                {canCreateNewsType && (
                  <Button variant="primary" onClick={() => setIsCreateOpen(true)}>Add Type</Button>
                )}
            </div>

            <DataTable 
                data={newsTypes}
                loading={loading}
                error={error}
                emptyMessage={'No news types found.'}
                columns={[
            { header: '#', accessor: (_row: NewsTypeItem, i: number) => i + 1 },
            { header: 'Name', accessor: 'name' as keyof NewsTypeItem },
            { header: 'Description', accessor: (row: NewsTypeItem) => row.description || '-' },
            { header: 'Created At', accessor: (row: NewsTypeItem) => row.created_at || '-' },
            { header: 'Updated At', accessor: (row: NewsTypeItem) => row.updated_at || '-' },
            { header: 'Actions', accessor: (row: NewsTypeItem) => (
              <div className="flex gap-2">
                {canEditNewsType && (
                  <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>Edit</Button>
                )}
                {canDeleteNewsType && (
                  <Button size="sm" variant="error" onClick={() => openDelete(row.id)}>Delete</Button>
                )}
              </div>
            )},
          ]}
            />
        </div>


    {/* Create Modal */}
        <Modal
            id="create_news_type"
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            title="Create News Type"
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
            id="edit_news_type"
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            title={editing ? `Edit: ${editing.name}` : 'Edit News Type'}
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
        <ToastContainer />
    </Container>
  )
}

export default NewsType