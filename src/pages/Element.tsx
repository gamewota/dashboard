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
import { Button } from '../components/Button';
import { createElement } from '../features/elements/elementSlice';
import { useToast } from '../hooks/useToast';

const Element = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: elements = [], loading, error } = useSelector((state: RootState) => state.elements);
  const { showToast } = useToast();

  const [editing, setEditing] = useState<null | ElementType>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchElements());
  }, [dispatch]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });

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

  const handleCreateElement = async () => {
    try {
      const result = await dispatch(createElement({ name: createForm.name, description: createForm.description })).unwrap();
      const resp = result as { message?: string } | string | undefined;
      const msg = typeof resp === 'object' ? resp?.message : (typeof resp === 'string' ? resp : undefined);
      showToast(msg || 'Element created', 'success');
      dispatch(fetchElements());
      setIsCreateOpen(false);
      setCreateForm({ name: '', description: '' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(message || 'Failed to create element', 'error');
    }
  };

  return (
    <Container className="flex-col items-center">
      
      <div className='overflow-x-auto'>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Elements</h1>
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>Add Element</Button>
        </div>
        <DataTable<ElementType>
          columns={[
            { header: '#', accessor: (_row: ElementType, i: number) => i + 1 },
            { header: 'Name', accessor: 'name' as keyof ElementType },
            { header: 'Description', accessor: (row: ElementType) => row.description || '-' },
            { header: 'Created At', accessor: (row: ElementType) => row.created_at || '-' },
            { header: 'Updated At', accessor: (row: ElementType) => row.updated_at || '-' },
            { header: 'Actions', accessor: (row: ElementType) => (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => openEditModal(row)}>Edit</Button>
                <Button size="sm" variant="error" onClick={() => openDeleteModal(row.id)}>Delete</Button>
              </div>
            ) },
          ]}
          data={elements as ElementType[]}
          rowKey={'id'}
          loading={loading}
          error={error}
          emptyMessage={'No elements found.'}
        />
        
        {/* Create Element Modal */}
        <Modal
          id="create_element"
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title={`Create Element`}
          footer={
            <>
              <Button onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreateElement}>Create</Button>
            </>
          }
        >
          <div className="space-y-2">
            <input
              className="input input-bordered w-full"
              value={createForm.name}
              onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Name"
            />
            <textarea
              className="textarea textarea-bordered w-full"
              value={createForm.description}
              onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description"
            />
          </div>
        </Modal>
        {/* Edit Element Modal */}
        <Modal
          id="edit_element"
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={editing ? `Edit Element: ${editing.name}` : 'Edit Element'}
          footer={
            <>
              <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveEdit}>Save</Button>
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
              <Button onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="error" onClick={handleConfirmDelete}>Delete</Button>
            </>
          }
        />
      </div>
    </Container>
  )
}

export default Element