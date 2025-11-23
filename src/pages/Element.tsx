import React, { useEffect } from 'react'
import Container from '../components/Container'
import { DataTable } from '../components/DataTable';

// Local element type (matches slice)
type ElementType = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  actions: React.ReactNode;
};
import { useDispatch, useSelector } from 'react-redux';
import { fetchElements, updateElement, deleteElement } from '../features/elements/elementSlice';
import type { RootState, AppDispatch } from '../store';
import { useState } from 'react';
import Modal from '../components/Modal';
import { useToast } from '../hooks/useToast';

const Element = () => {
  const dispatch = useDispatch<AppDispatch>();
  const elements = useSelector((state: RootState) => state.elements.data ?? []);
  const loading = useSelector((state: RootState) => state.elements.loading);
  const error = useSelector((state: RootState) => state.elements.error);
  const { showToast } = useToast();

  const [editing, setEditing] = useState<null | ElementType>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchElements());
  }, [dispatch]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openEditModal = (el: ElementType) => {
    setEditing(el);
    setEditForm({ name: el.name, description: el.description || '' });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      const result = await dispatch(updateElement({ id: editing.id, name: editForm.name, description: editForm.description })).unwrap();
      const resp = result as { message?: string } | string | undefined;
      const msg = typeof resp === 'object' ? resp?.message : (typeof resp === 'string' ? resp : undefined);
      showToast(msg || 'Element updated', 'success');
      dispatch(fetchElements());
      setIsEditOpen(false);
      setEditing(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(message || 'Failed to update element', 'error');
    }
  };

  const openDeleteModal = (id: number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingId == null) return;
    try {
      const result = await dispatch(deleteElement(deletingId)).unwrap();
      const resp = result as { message?: string } | string | undefined;
      const msg = typeof resp === 'object' ? resp?.message : (typeof resp === 'string' ? resp : undefined);
      showToast(msg || 'Element deleted', 'success');
      dispatch(fetchElements());
      setIsDeleteOpen(false);
      setDeletingId(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(message || 'Failed to delete element', 'error');
    }
  };

  return (
    <Container className="flex-col items-center">
      {loading && (
        <div className='flex items-center'>
          <span className="loading loading-spinner" />
          <span className="ml-2">Loading elements...</span>
        </div>
      )}

      {error && (
        <div className='text-error'>Error: {error}</div>
      )}



      <div className='overflow-x-auto'>
        <h1 className="text-2xl font-bold mb-4">Elements</h1>
        <DataTable<ElementType>
          columns={[
            { header: '#', accessor: (_row: ElementType, i: number) => i + 1 as React.ReactNode },
            { header: 'Name', accessor: 'name' as keyof ElementType },
            { header: 'Description', accessor: (row: ElementType) => row.description || '-' },
            { header: 'Created At', accessor: (row: ElementType) => row.created_at || '-' },
            { header: 'Updated At', accessor: (row: ElementType) => row.updated_at || '-' },
            { header: 'Actions', accessor: (row: ElementType) => (
              <div className="flex gap-2">
                <button className="btn btn-sm btn-ghost" onClick={() => openEditModal(row)}>Edit</button>
                <button className="btn btn-sm btn-error" onClick={() => openDeleteModal(row.id)}>Delete</button>
              </div>
            ) },
          ]}
          data={elements as ElementType[]}
          rowKey={'id'}
          loading={loading}
          error={error}
          emptyMessage={'No elements found.'}
        />
        {/* Edit Element Modal */}
        <Modal
          id="edit_element"
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={editing ? `Edit Element: ${editing.name}` : 'Edit Element'}
          footer={
            <>
              <button className="btn" onClick={() => setIsEditOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
            </>
          }
        >
          <div className="space-y-2">
            <input
              className="input input-bordered w-full"
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Name"
            />
            <textarea
              className="textarea textarea-bordered w-full"
              value={editForm.description}
              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description"
            />
          </div>
        </Modal>

        {/* Delete confirmation modal */}
        <Modal
          id="delete_element_confirmation"
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title={`Are you sure you want to delete this element?`}
          footer={
            <>
              <button className="btn" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
              <button className="btn btn-error" onClick={handleConfirmDelete}>Delete</button>
            </>
          }
        />
      </div>
    </Container>
  )
}

export default Element