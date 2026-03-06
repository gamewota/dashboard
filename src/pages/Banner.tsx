import Container from '../components/Container';
import { DataTable } from '../components/DataTable';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import type { Banner, BannerPayload } from '../lib/schemas/banner';
import { uploadAssetWithPresigned } from '../helpers/uploadAsset';
import {
  createBanner,
  fetchBanners,
  updateBanner,
  deleteBanner,
  fetchBannerById,
  clearCurrentBanner,
} from '../features/banners/bannerSlice';
import Modal from '../components/Modal';
import { useHasPermission } from '../hooks/usePermissions';
import { getBannerColumns } from './bannerColumns';
import { fetchBannerTypes } from '../features/bannerTypes/bannerTypeSlice';
import { fetchEvents } from '../features/events/eventSlice';
import { fetchGachaPacks } from '../features/cards/gachaPackSlice';

const Banners = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { banners, currentBanner, loading, error } = useSelector((state: RootState) => state.banners);
  const { data: bannerTypes = [] } = useSelector((state: RootState) => state.bannerTypes);
  const { data: events = [] } = useSelector((state: RootState) => state.events);
  const { list: gachaPacks = [] } = useSelector((state: RootState) => state.gachaPack);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isUploadingCreate, setIsUploadingCreate] = useState(false);
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);
  const [assetPreviewCreate, setAssetPreviewCreate] = useState<string>('');
  const [assetPreviewEdit, setAssetPreviewEdit] = useState<string>('');
  const isMountedRef = useRef(true);

  const [createForm, setCreateForm] = useState<BannerPayload>({
    name: '',
    banner_type_id: 0,
    asset_id: 0,
    start_at: '',
    end_at: '',
    gacha_pack_id: undefined,
    event_id: undefined,
    action_url: '',
  });

  const [editForm, setEditForm] = useState<BannerPayload>({
    name: '',
    banner_type_id: 0,
    asset_id: 0,
    start_at: '',
    end_at: '',
    gacha_pack_id: undefined,
    event_id: undefined,
    action_url: '',
  });

  const canCreateBanner = useHasPermission('banners.create');
  const canEditBanner = useHasPermission('banners.edit');
  const canDeleteBanner = useHasPermission('banners.delete');

  useEffect(() => {
    isMountedRef.current = true;
    dispatch(fetchBanners());
    dispatch(fetchBannerTypes());
    dispatch(fetchEvents());
    dispatch(fetchGachaPacks());
    return () => {
      isMountedRef.current = false;
    };
  }, [dispatch]);

  const { showToast, ToastContainer } = useToast();

  const openEdit = (t: Banner) => {
    setEditing(t);
    setEditForm({
      name: t.name,
      banner_type_id: t.banner_type_id,
      asset_id: t.asset_id,
      start_at: new Date(t.start_at).toISOString().slice(0, 16),
      end_at: new Date(t.end_at).toISOString().slice(0, 16),
      gacha_pack_id: t.gacha_pack_id ?? undefined,
      event_id: t.event_id ?? undefined,
      action_url: t.action_url ?? '',
    });
    setAssetPreviewEdit('');
    setIsEditOpen(true);
  };

  const openDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const openDetails = (id: number) => {
    dispatch(fetchBannerById(id));
    setIsDetailsOpen(true);
  };

  const handleCreateChange = (field: keyof BannerPayload, value: string | number | undefined) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditChange = (field: keyof BannerPayload, value: string | number | undefined) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (form: BannerPayload): string | null => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.banner_type_id) return 'Banner type is required';
    if (!form.asset_id) return 'Asset is required';
    if (!form.start_at) return 'Start date is required';
    if (!form.end_at) return 'End date is required';

    // Check that either event_id or gacha_pack_id is filled, but not both
    const hasEvent = form.event_id !== undefined && form.event_id !== 0;
    const hasGachaPack = form.gacha_pack_id !== undefined && form.gacha_pack_id !== 0;

    if (hasEvent && hasGachaPack) {
      return 'Cannot have both event and gacha pack. Choose one.';
    }

    if (!hasEvent && !hasGachaPack) {
      return 'Must provide either event or gacha pack.';
    }

    return null;
  };

  const handleCreate = async () => {
    const validationError = validateForm(createForm);
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    try {
      // Prepare payload - remove empty optional fields
      const payload: BannerPayload = {
        name: createForm.name,
        banner_type_id: createForm.banner_type_id,
        asset_id: createForm.asset_id,
        start_at: new Date(createForm.start_at).toISOString(),
        end_at: new Date(createForm.end_at).toISOString(),
      };

      if (createForm.gacha_pack_id) {
        payload.gacha_pack_id = createForm.gacha_pack_id;
      }

      if (createForm.event_id) {
        payload.event_id = createForm.event_id;
      }

      if (createForm.action_url && createForm.action_url.trim()) {
        payload.action_url = createForm.action_url;
      }

      const result = await dispatch(createBanner(payload)).unwrap();
      const resp = result as unknown;
      let msg: string | undefined;
      if (resp && typeof resp === 'object' && 'message' in resp) {
        const r = resp as Record<string, unknown>;
        if (typeof r.message === 'string') msg = r.message;
      }
      showToast(msg || 'Banner created successfully', 'success');
      dispatch(fetchBanners());
      setIsCreateOpen(false);
      setCreateForm({
        name: '',
        banner_type_id: 0,
        asset_id: 0,
        start_at: '',
        end_at: '',
        gacha_pack_id: undefined,
        event_id: undefined,
        action_url: '',
      });
      setAssetPreviewCreate('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(message || 'Failed to create banner', 'error');
    }
  };

  const handleEdit = async () => {
    if (!editing) return;

    const validationError = validateForm(editForm);
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    try {
      // Prepare payload
      const payload: BannerPayload = {
        name: editForm.name,
        banner_type_id: editForm.banner_type_id,
        asset_id: editForm.asset_id,
        start_at: new Date(editForm.start_at).toISOString(),
        end_at: new Date(editForm.end_at).toISOString(),
      };

      if (editForm.gacha_pack_id) {
        payload.gacha_pack_id = editForm.gacha_pack_id;
      }

      if (editForm.event_id) {
        payload.event_id = editForm.event_id;
      }

      if (editForm.action_url && editForm.action_url.trim()) {
        payload.action_url = editForm.action_url;
      }

      const result = await dispatch(updateBanner({ id: editing.id, payload })).unwrap();
      const resp = result as unknown;
      let msg: string | undefined;
      if (resp && typeof resp === 'object' && 'message' in resp) {
        const r = resp as Record<string, unknown>;
        if (typeof r.message === 'string') msg = r.message;
      }
      showToast(msg || 'Banner updated successfully', 'success');
      dispatch(fetchBanners());
      setIsEditOpen(false);
      setEditing(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(message || 'Failed to update banner', 'error');
    }
  };

  const handleDelete = async () => {
    if (deletingId == null) return;
    try {
      const result = await dispatch(deleteBanner(deletingId)).unwrap();
      const resp = result as unknown;
      let msg: string | undefined;
      if (resp && typeof resp === 'object' && 'message' in resp) {
        const r = resp as Record<string, unknown>;
        if (typeof r.message === 'string') msg = r.message;
      }
      showToast(msg || 'Banner deleted successfully', 'success');
      dispatch(fetchBanners());
      setIsDeleteOpen(false);
      setDeletingId(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(message || 'Failed to delete banner', 'error');
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsOpen(false);
    dispatch(clearCurrentBanner());
  };

  return (
    <Container className="flex-col items-center">
      <ToastContainer />
      <div className="overflow-x-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Banners</h1>
          {canCreateBanner && (
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              Add Banner
            </Button>
          )}
        </div>
        <DataTable<Banner>
          columns={getBannerColumns({
            canEditBanner,
            canDeleteBanner,
            openEdit,
            openDelete,
            openDetails,
          })}
          data={banners}
          rowKey="id"
          loading={loading}
          error={error}
          emptyMessage="No banners found."
        />

        {/* Create Banner Modal */}
        <Modal
          id="create_banner"
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create Banner"
          footer={
            <>
              <Button onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreate}>
                Create
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={createForm.name}
                onChange={(e) => handleCreateChange('name', e.target.value)}
                placeholder="Banner name"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Banner Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={createForm.banner_type_id}
                onChange={(e) => handleCreateChange('banner_type_id', parseInt(e.target.value))}
              >
                <option value={0}>Select banner type</option>
                {bannerTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Banner Asset</span>
              </label>
              <div className="flex gap-2">
                <Button
                  disabled={isUploadingCreate}
                  onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async () => {
                      const f = input.files?.[0];
                      if (!f) return;
                      setIsUploadingCreate(true);
                      try {
                        const asset = await uploadAssetWithPresigned(f, undefined, undefined);
                        if (!isMountedRef.current) return;
                        setAssetPreviewCreate(asset.assets_url);
                        handleCreateChange('asset_id', asset.id);
                        showToast('Banner asset uploaded', 'success');
                      } catch (err) {
                        console.error('Asset upload failed', err);
                        if (isMountedRef.current) showToast('Failed to upload asset', 'error');
                      } finally {
                        if (isMountedRef.current) setIsUploadingCreate(false);
                      }
                    };
                    input.click();
                  }}
                >
                  {isUploadingCreate ? 'Uploading...' : 'Upload Asset'}
                </Button>
                {assetPreviewCreate && (
                  <div className="flex items-center gap-2">
                    <img src={assetPreviewCreate} alt="Preview" className="w-20 h-20 object-cover rounded" />
                    <span className="text-sm text-success">✓ Uploaded</span>
                  </div>
                )}
              </div>
              {!assetPreviewCreate && createForm.asset_id === 0 && (
                <p className="text-sm text-base-content/60 mt-1">Upload a banner image (required)</p>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text">Event (Optional - choose Event OR Gacha Pack)</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={createForm.event_id ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  handleCreateChange('event_id', val === 0 ? undefined : val);
                  if (val !== 0) handleCreateChange('gacha_pack_id', undefined);
                }}
              >
                <option value={0}>No event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Gacha Pack (Optional - choose Event OR Gacha Pack)</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={createForm.gacha_pack_id ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  handleCreateChange('gacha_pack_id', val === 0 ? undefined : val);
                  if (val !== 0) handleCreateChange('event_id', undefined);
                }}
              >
                <option value={0}>No gacha pack</option>
                {gachaPacks.map((pack) => (
                  <option key={pack.id} value={pack.id}>
                    {pack.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Start Date</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={createForm.start_at}
                onChange={(e) => handleCreateChange('start_at', e.target.value)}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">End Date</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={createForm.end_at}
                onChange={(e) => handleCreateChange('end_at', e.target.value)}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Action URL (Optional)</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={createForm.action_url}
                onChange={(e) => handleCreateChange('action_url', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </Modal>

        {/* Edit Banner Modal */}
        <Modal
          id="edit_banner"
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Banner"
          footer={
            <>
              <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleEdit}>
                Save
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={editForm.name}
                onChange={(e) => handleEditChange('name', e.target.value)}
                placeholder="Banner name"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Banner Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={editForm.banner_type_id}
                onChange={(e) => handleEditChange('banner_type_id', parseInt(e.target.value))}
              >
                <option value={0}>Select banner type</option>
                {bannerTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Banner Asset</span>
              </label>
              <div className="flex gap-2">
                <Button
                  disabled={isUploadingEdit}
                  onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async () => {
                      const f = input.files?.[0];
                      if (!f) return;
                      setIsUploadingEdit(true);
                      try {
                        const asset = await uploadAssetWithPresigned(f, undefined, undefined);
                        if (!isMountedRef.current) return;
                        setAssetPreviewEdit(asset.assets_url);
                        handleEditChange('asset_id', asset.id);
                        showToast('Banner asset uploaded', 'success');
                      } catch (err) {
                        console.error('Asset upload failed', err);
                        if (isMountedRef.current) showToast('Failed to upload asset', 'error');
                      } finally {
                        if (isMountedRef.current) setIsUploadingEdit(false);
                      }
                    };
                    input.click();
                  }}
                >
                  {isUploadingEdit ? 'Uploading...' : 'Upload New Asset'}
                </Button>
                {assetPreviewEdit && (
                  <div className="flex items-center gap-2">
                    <img src={assetPreviewEdit} alt="Preview" className="w-20 h-20 object-cover rounded" />
                    <span className="text-sm text-success">✓ Uploaded</span>
                  </div>
                )}
              </div>
              {!assetPreviewEdit && (
                <p className="text-sm text-base-content/60 mt-1">Current asset ID: {editForm.asset_id} (upload new to replace)</p>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text">Event (Optional - choose Event OR Gacha Pack)</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={editForm.event_id ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  handleEditChange('event_id', val === 0 ? undefined : val);
                  if (val !== 0) handleEditChange('gacha_pack_id', undefined);
                }}
              >
                <option value={0}>No event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Gacha Pack (Optional - choose Event OR Gacha Pack)</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={editForm.gacha_pack_id ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  handleEditChange('gacha_pack_id', val === 0 ? undefined : val);
                  if (val !== 0) handleEditChange('event_id', undefined);
                }}
              >
                <option value={0}>No gacha pack</option>
                {gachaPacks.map((pack) => (
                  <option key={pack.id} value={pack.id}>
                    {pack.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Start Date</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={editForm.start_at}
                onChange={(e) => handleEditChange('start_at', e.target.value)}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">End Date</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={editForm.end_at}
                onChange={(e) => handleEditChange('end_at', e.target.value)}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Action URL (Optional)</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={editForm.action_url}
                onChange={(e) => handleEditChange('action_url', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          id="delete_banner"
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="Delete Banner"
          footer={
            <>
              <Button onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="error" onClick={handleDelete}>
                Delete
              </Button>
            </>
          }
        >
          <p>Are you sure you want to delete this banner?</p>
        </Modal>

        {/* Banner Details Modal */}
        <Modal
          id="banner_details"
          isOpen={isDetailsOpen}
          onClose={closeDetailsModal}
          title="Banner Details"
          footer={
            <Button onClick={closeDetailsModal}>Close</Button>
          }
        >
          {currentBanner ? (
            <div className="space-y-4">
              <div>
                <strong>Name:</strong> {currentBanner.name}
              </div>
              <div>
                <strong>Type:</strong> {currentBanner.banner_type_name}
              </div>
              <div>
                <strong>Start:</strong> {new Date(currentBanner.start_at).toLocaleString()}
              </div>
              <div>
                <strong>End:</strong> {new Date(currentBanner.end_at).toLocaleString()}
              </div>
              {currentBanner.action_url && (
                <div>
                  <strong>Action URL:</strong>{' '}
                  <a href={currentBanner.action_url} className="link link-primary" target="_blank" rel="noopener noreferrer">
                    {currentBanner.action_url}
                  </a>
                </div>
              )}

              {/* Event Details */}
              {currentBanner.event_details && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Event Details</h3>
                  <div>
                    <strong>Event Name:</strong> {currentBanner.event_details.name}
                  </div>
                  {currentBanner.event_details.songs && currentBanner.event_details.songs.length > 0 && (
                    <div className="mt-2">
                      <strong>Songs:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {currentBanner.event_details.songs.map((song) => (
                          <li key={song.id}>{song.song_title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Gacha Pack Details */}
              {currentBanner.gacha_pack_details && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Gacha Pack Details</h3>
                  <div>
                    <strong>Pack Name:</strong> {currentBanner.gacha_pack_details.name}
                  </div>
                  <div>
                    <strong>Price:</strong> {currentBanner.gacha_pack_details.price}
                  </div>
                  {currentBanner.gacha_pack_details.cards && currentBanner.gacha_pack_details.cards.length > 0 && (
                    <div className="mt-2">
                      <strong>Cards ({currentBanner.gacha_pack_details.cards.length}):</strong>
                      <div className="overflow-x-auto mt-1">
                        <table className="table table-compact w-full">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Probability</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentBanner.gacha_pack_details.cards.map((card) => (
                              <tr key={card.id}>
                                <td>{card.name}</td>
                                <td>{(card.effective_probability * 100).toFixed(2)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">Loading banner details...</div>
          )}
        </Modal>
      </div>
    </Container>
  );
};

export default Banners;
