import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../components/Container';
import arrowLeft from '/image/arrow-left.svg';
import { Button } from '../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchEventById, updateEvent, deleteEvent } from '../features/events/eventSlice';
import type { Event } from '../lib/schemas/event';
import Modal from '../components/Modal';
import { useToast } from '../hooks/useToast';
import { useHasPermission } from "../hooks/usePermissions";

const EventDetail: React.FC = () => {
  const { id } = useParams();
  const canEditEvent = useHasPermission('events.edit');
  const canDeleteEvent = useHasPermission('events.delete');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { entities, loading, error } = useSelector((s: RootState) => s.events);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchEventById(Number(id)));
  }, [dispatch, id]);

  const event: Event | undefined = id ? entities[String(id)] : undefined;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast, ToastContainer } = useToast();
  const [editForm, setEditForm] = useState({ name: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (event) {
      setEditForm({ name: event.name });
    }
  }, [event]);

  const handleSave = async () => {
    if (!event) return;
    setIsSaving(true);
    try {
      await dispatch(updateEvent({
        id: event.id,
        name: editForm.name,
      })).unwrap();
      setEditOpen(false);
      dispatch(fetchEventById(event.id));
      showToast('Event updated', 'success');
    } catch (err) {
      console.error('Failed to update event', err);
      showToast('Failed to update event', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteEvent(event.id)).unwrap();
      setDeleteOpen(false);
      showToast('Event deleted', 'success');
      navigate('/dashboard/events');
    } catch (err) {
      console.error('Failed to delete event', err);
      showToast('Failed to delete event', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && !event) {
    return (
      <Container className="flex-col items-center">
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Container>
    );
  }

  if (error && !event) {
    return (
      <Container className="flex-col items-center">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="flex-col items-center">
        <div className="alert alert-warning">
          <span>Event not found</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="flex-col items-center">
      <ToastContainer />
      <div className="w-full max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard/events')}
          className="flex items-center gap-2 mb-4 text-sm hover:underline"
        >
          <img src={arrowLeft} alt="Back" className="w-4 h-4" />
          Back to Events
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <div className="flex gap-2">
            {canEditEvent && (
              <Button variant="primary" onClick={() => setEditOpen(true)}>
                Edit Event
              </Button>
            )}
            {canDeleteEvent && (
              <Button variant="error" onClick={() => setDeleteOpen(true)}>
                Delete Event
              </Button>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Event ID</p>
                <p className="font-semibold">{event.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Event Name</p>
                <p className="font-semibold">{event.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-semibold">{new Date(event.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated At</p>
                <p className="font-semibold">{new Date(event.updated_at).toLocaleString()}</p>
              </div>
              {event.deleted_at && (
                <div>
                  <p className="text-sm text-gray-500">Deleted At</p>
                  <p className="font-semibold text-error">{new Date(event.deleted_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          id="edit_event_modal"
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          title="Edit Event"
          footer={
            <>
              <Button onClick={() => setEditOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Event Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={editForm.name}
                onChange={(e) => setEditForm({ name: e.target.value })}
                placeholder="Event Name"
              />
            </div>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          id="delete_event_modal"
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          title="Delete Event"
          footer={
            <>
              <Button onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="error" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          }
        >
          <p>Are you sure you want to delete the event "{event.name}"? This action cannot be undone.</p>
        </Modal>
      </div>
    </Container>
  );
};

export default EventDetail;
