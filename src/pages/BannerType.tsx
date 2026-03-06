import Container from '../components/Container'
import { DataTable } from '../components/DataTable';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import type { BannerTypeItem } from '../features/bannerTypes/bannerTypeSlice';
import { createBannerType, fetchBannerTypes, updateBannerType, deleteBannerType } from '../features/bannerTypes/bannerTypeSlice';
import Modal from '../components/Modal';
import { useHasPermission } from '../hooks/usePermissions';
import { getBannerTypeColumns } from './bannerTypeColumns';

const BannerType = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data: bannerTypes = [], loading, error } = useSelector((state: RootState) => state.bannerTypes);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editing, setEditing] = useState<BannerTypeItem | null>(null);
    const [createForm, setCreateForm] = useState({ name: '' });
    const [editForm, setEditForm] = useState({ name: '' });
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const canCreateBannerType = useHasPermission('banner_type.create');
    const canEditBannerType = useHasPermission('banner_type.edit');
    const canDeleteBannerType = useHasPermission('banner_type.delete');

    useEffect(() => {
        dispatch(fetchBannerTypes());
    }, [dispatch]);

    const { showToast, ToastContainer } = useToast();

    const openEdit = (t: BannerTypeItem) => {
        setEditing(t);
        setEditForm({ name: t.name });
        setIsEditOpen(true);
    };

    const openDelete = (id: number) => {
        setDeletingId(id);
        setIsDeleteOpen(true);
    };

    const handleCreate = async () => {
        if (!createForm.name.trim()) {
            showToast('Name is required', 'error');
            return;
        }
        try {
            const result = await dispatch(createBannerType({ name: createForm.name })).unwrap();
            const resp = result as unknown;
            let msg: string | undefined;
            if (resp && typeof resp === 'object' && 'message' in resp) {
                const r = resp as Record<string, unknown>;
                if (typeof r.message === 'string') msg = r.message;
            }
            showToast(msg || 'Banner type created successfully', 'success');
            dispatch(fetchBannerTypes());
            setIsCreateOpen(false);
            setCreateForm({ name: '' });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            showToast(message || 'Failed to create banner type', 'error');
        }
    };

    const handleEdit = async () => {
        if (!editing) return;
        if (!editForm.name.trim()) {
            showToast('Name is required', 'error');
            return;
        }
        try {
            const result = await dispatch(updateBannerType({ id: editing.id, name: editForm.name })).unwrap();
            const resp = result as unknown;
            let msg: string | undefined;
            if (resp && typeof resp === 'object' && 'message' in resp) {
                const r = resp as Record<string, unknown>;
                if (typeof r.message === 'string') msg = r.message;
            }
            showToast(msg || 'Banner type updated successfully', 'success');
            dispatch(fetchBannerTypes());
            setIsEditOpen(false);
            setEditing(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            showToast(message || 'Failed to update banner type', 'error');
        }
    };

    const handleDelete = async () => {
        if (deletingId == null) return;
        try {
            const result = await dispatch(deleteBannerType(deletingId)).unwrap();
            const resp = result as unknown;
            let msg: string | undefined;
            if (resp && typeof resp === 'object' && 'message' in resp) {
                const r = resp as Record<string, unknown>;
                if (typeof r.message === 'string') msg = r.message;
            }
            showToast(msg || 'Banner type deleted successfully', 'success');
            dispatch(fetchBannerTypes());
            setIsDeleteOpen(false);
            setDeletingId(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            showToast(message || 'Failed to delete banner type', 'error');
        }
    };

    return (
        <Container>
            <ToastContainer />
            <div className="overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">Banner Types</h1>
                    {canCreateBannerType && (
                        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>Add Banner Type</Button>
                    )}
                </div>

                <DataTable 
                    data={bannerTypes}
                    loading={loading}
                    error={error}
                    emptyMessage={'No banner types found.'}
                    columns={getBannerTypeColumns({
                        canEditBannerType,
                        canDeleteBannerType,
                        openEdit,
                        openDelete,
                    })}
                />
            </div>

            {/* Create Modal */}
            <Modal
                id="create_banner_type"
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create Banner Type"
                footer={
                    <>
                        <Button onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleCreate}>Create</Button>
                    </>
                }
            >
                <div className="space-y-2">
                    <div>
                        <label htmlFor="create-name" className="block text-sm font-medium">Name</label>
                        <input 
                            id="create-name" 
                            className="input input-bordered w-full" 
                            value={createForm.name} 
                            onChange={(e) => setCreateForm({ name: e.target.value })} 
                            placeholder="Enter banner type name"
                        />
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                id="edit_banner_type"
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title={editing ? `Edit: ${editing.name}` : 'Edit Banner Type'}
                footer={
                    <>
                        <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleEdit}>Save</Button>
                    </>
                }
            >
                <div className="space-y-2">
                    <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium">Name</label>
                        <input 
                            id="edit-name" 
                            className="input input-bordered w-full" 
                            value={editForm.name} 
                            onChange={(e) => setEditForm({ name: e.target.value })} 
                            placeholder="Enter banner type name"
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete confirmation */}
            <Modal
                id="delete_banner_type"
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Delete Banner Type"
                footer={
                    <>
                        <Button onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="error" onClick={handleDelete}>Delete</Button>
                    </>
                }
            >
                <p>Are you sure you want to delete this banner type? This action cannot be undone.</p>
            </Modal>
        </Container>
    );
};

export default BannerType;
