import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import { DataTable } from '../components/DataTable';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, updateEvent, deleteEvent, createEvent } from '../features/events/eventSlice';
import type { RootState, AppDispatch } from '../store';
import type { Event } from '../lib/schemas/event';
import Modal from '../components/Modal';
import { Button } from '../components/Button';
import { useToast } from '../hooks/useToast';
import { useHasPermission } from '../hooks/usePermissions';

const Events = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: events = [], loading, error } = useSelector((state: RootState) => state.events);
  const { showToast } = useToast();
  const canCreateEvent = useHasPermission('events.create');
  const canEditEvent = useHasPermission('events.edit');
  const canDeleteEvent = useHasPermission('events.delete');

  const [editing, setEditing] = useState<null | Event>(null);
  const [editForm, setEditForm] = useState({ name: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '' });

  const openEditModal = (event: Event) => {
    setEditing(event);
    setEditForm({ name: event.name });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    if (!editForm.name.trim()) {
      showToast('Please enter a valid event name', 'error');
      return;
    }
    try {
      const result = await dispatch(updateEvent({ id: editing.id, name: editForm.name })).unwrap();
      const resp = result as { message?: string } | string | undefined;
      const msg = typeof resp === 'object' ? resp?.message : (typeof resp === 'string' ? resp : undefined);
      showToast(msg || 'Event updated', 'success');
      dispatch(fetchEvents());
      setIsEditOpen(false);
      setEditing(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(message || 'Failed to update event', 'error');
    }
  };

  const openDeleteModal = (id: number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingId == null) return;
    try {
      const result = await dispatch(deleteEvent(deletingId)).unwrap();
      const resp = result as { message?: string } | string | undefined;
      const msg = typeof resp === 'object' ? resp?.message : (typeof resp === 'string' ? resp : undefined);
      showToast(msg || 'Event deleted', 'success');
      dispatch(fetchEvents());
      setIsDeleteOpen(false);
      setDeletingId(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(message || 'Failed to delete event', 'error');
    }
  };

  const handleCreateEvent = async () => {
    if (!createForm.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    try {
      const result = await dispatch(createEvent({ name: createForm.name })).unwrap();
      const resp = result as { message?: string } | string | undefined;
      const msg = typeof resp === 'object' ? resp?.message : (typeof resp === 'string' ? resp : undefined);
      showToast(msg || 'Event created', 'success');
      dispatch(fetchEvents());
      setIsCreateOpen(false);
      setCreateForm({ name: '' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(message || 'Failed to create event', 'error');
    }
  };

  return (
    <Container className="flex-col items-center">
      <div className='overflow-x-auto'>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Events</h1>
          {canCreateEvent && (
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>Add Event</Button>
          )}
        </div>
        <DataTable<Event>
          columns={[
            { header: '#', accessor: (_row: Event, i: number) => i + 1 },
            { header: 'Name', accessor: 'name' as keyof Event },
            { header: 'Created At', accessor: (row: Event) => new Date(row.created_at).toLocaleString() },
            { header: 'Updated At', accessor: (row: Event) => new Date(row.updated_at).toLocaleString() },
            { header: 'Actions', accessor: (row: Event) => (
              <div className="flex gap-2">
                <Link to={`/dashboard/events/${row.id}`}>
                  <Button size="sm" variant="info">Detail</Button>
                </Link>
                {canEditEvent && (
                  <Button size="sm" variant="ghost" onClick={() => openEditModal(row)}>Edit</Button>
                )}
                {canDeleteEvent && (
                  <Button size="sm" variant="error" onClick={() => openDeleteModal(row.id)}>Delete</Button>
                )}
              </div>
            ) },
          ]}
          data={events as Event[]}
          rowKey={'id'}
          loading={loading}
          error={error}
          emptyMessage={'No events found.'}
        />
        
        {/* Create Event Modal */}
        <Modal
          id="create_event"
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title={`Create Event`}
          footer={
            <>
              <Button onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreateEvent}>Create</Button>
            </>
          }
        >
          <div className="space-y-2">
            <input
              className="input input-bordered w-full"
              value={createForm.name}
              onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Event Name"
            />
          </div>
        </Modal>

        {/* Edit Event Modal */}
        <Modal
          id="edit_event"
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={editing ? `Edit Event: ${editing.name}` : 'Edit Event'}
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
              placeholder="Event Name"
            />
          </div>
        </Modal>

        {/* Delete confirmation modal */}
        <Modal
          id="delete_event_confirmation"
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title={`Are you sure you want to delete this event?`}
          footer={
            <>
              <Button onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="error" onClick={handleConfirmDelete}>Delete</Button>
            </>
          }
        />
      </div>
    </Container>
  );
};

export default Events;
