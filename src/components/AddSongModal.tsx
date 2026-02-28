import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { createSong } from '../features/songs/songSlice';
import { fetchElements } from '../features/elements/elementSlice';
import { fetchAssetTypes } from '../features/assetTypes/assetTypeSlice';
import { uploadAssetWithPresigned } from '../helpers/uploadAsset';
import { useToast } from '../hooks/useToast';
import Modal from './Modal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (songTitle: string) => void;
};

export function AddSongModal({ isOpen, onClose, onSuccess }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast, ToastContainer } = useToast();
  
  // Form fields
  const [songTitle, setSongTitle] = useState('');
  const [elementId, setElementId] = useState<number | ''>('');
  const [reffStart, setReffStart] = useState<string>('');
  const [reffEnd, setReffEnd] = useState<string>('');
  const [reffDuration, setReffDuration] = useState<string>('');
  
  // Asset IDs
  const [videoAssetId, setVideoAssetId] = useState<number | null>(null);
  const [audioAssetId, setAudioAssetId] = useState<number | null>(null);
  const [artworkAssetId, setArtworkAssetId] = useState<number | null>(null);
  
  // Upload states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingArtwork, setUploadingArtwork] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const elements = useSelector((state: RootState) => state.elements.data);
  const elementsLoading = useSelector((state: RootState) => state.elements.loading);
  const assetTypes = useSelector((state: RootState) => state.assetTypes.data);
  const assetTypesLoading = useSelector((state: RootState) => state.assetTypes.loading);

  // Map asset types by exact name
  // Based on API: artwork (id: 1), song (id: 2), mv (id: 3)
  const assetTypeIds = useMemo(() => {
    const findTypeId = (name: string): number | -1 => {
      const type = assetTypes.find((at) => at.name.toLowerCase() === name.toLowerCase());
      return type?.id ?? -1;
    };

    return {
      artwork: findTypeId('artwork'),  // id: 1
      audio: findTypeId('song'),       // id: 2
      video: findTypeId('mv'),         // id: 3
    };
  }, [assetTypes]);

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setSongTitle('');
      setElementId('');
      setReffStart('');
      setReffEnd('');
      setReffDuration('');
      setVideoAssetId(null);
      setAudioAssetId(null);
      setArtworkAssetId(null);
      setError(null);
      setLoading(false);
      
      // Fetch elements and asset types
      dispatch(fetchElements());
      dispatch(fetchAssetTypes());
    }
  }, [isOpen, dispatch]);

  const handleFileUpload = async (
    file: File | undefined,
    type: 'video' | 'audio' | 'artwork' | 'mv'
  ) => {
    if (!file) return;
    
    const setUploading = type === 'video' 
      ? setUploadingVideo 
      : type === 'audio' 
        ? setUploadingAudio 
        : setUploadingArtwork;
    
    const setAssetId = type === 'video'
      ? setVideoAssetId
      : type === 'audio'
        ? setAudioAssetId
        : setArtworkAssetId;
    
    setUploading(true);
    setError(null);
    
    try {
      // Get asset type ID based on file type
      const assetTypeId = type === 'video' 
        ? assetTypeIds.video 
        : type === 'audio' 
          ? assetTypeIds.audio 
          : assetTypeIds.artwork;
      
      if (assetTypeId === -1) {
        throw new Error(`No asset type found for ${type}. Please check asset types configuration.`);
      }
      
      const asset = await uploadAssetWithPresigned(file, undefined, undefined, assetTypeId);
      setAssetId(asset.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to upload ${type}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    
    // Validation
    if (!songTitle.trim()) {
      setError('Song title is required');
      return;
    }
    if (!videoAssetId) {
      setError('Video file is required');
      return;
    }
    if (!audioAssetId) {
      setError('Audio file is required');
      return;
    }
    if (!artworkAssetId) {
      setError('Artwork file is required');
      return;
    }
    if (!elementId) {
      setError('Element is required');
      return;
    }
    
    setLoading(true);
    
    const payload = {
      song_title: songTitle.trim(),
      song_asset_video_id: videoAssetId,
      song_asset_audio_id: audioAssetId,
      song_asset_artwork_id: artworkAssetId,
      element_id: Number(elementId),
      ...(reffStart && { reff_start: Number(reffStart) }),
      ...(reffEnd && { reff_end: Number(reffEnd) }),
      ...(reffDuration && { reff_duration: Number(reffDuration) }),
    };
    
    try {
      await dispatch(createSong(payload)).unwrap();
      onSuccess?.(payload.song_title);
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create song';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Song">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Song Title */}
        <div>
          <label className="label">
            <span className="label-text">Song Title *</span>
          </label>
          <input
            type="text"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="Enter song title"
            className="input input-bordered w-full"
          />
        </div>

        {/* Element Dropdown */}
        <div>
          <label className="label">
            <span className="label-text">Element *</span>
          </label>
          <select
            value={elementId}
            onChange={(e) => setElementId(e.target.value === '' ? '' : Number(e.target.value))}
            className="select select-bordered w-full"
            disabled={elementsLoading}
          >
            <option value="">{elementsLoading ? 'Loading...' : 'Select element'}</option>
            {elements.map((el) => (
              <option key={el.id} value={el.id}>{el.name}</option>
            ))}
          </select>
        </div>

        {/* Video Upload */}
        <div>
          <label className="label">
            <span className="label-text">Video File *</span>
            {videoAssetId && <span className="label-text-alt text-success">✓ Uploaded (ID: {videoAssetId})</span>}
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileUpload(e.target.files?.[0], 'video')}
            className="file-input file-input-bordered w-full"
            disabled={uploadingVideo || assetTypesLoading}
          />
          {assetTypesLoading && <span className="text-sm text-info mt-1">Loading asset types...</span>}
          {uploadingVideo && <span className="text-sm text-info mt-1">Uploading video...</span>}
        </div>

        {/* Audio Upload */}
        <div>
          <label className="label">
            <span className="label-text">Audio File *</span>
            {audioAssetId && <span className="label-text-alt text-success">✓ Uploaded (ID: {audioAssetId})</span>}
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => handleFileUpload(e.target.files?.[0], 'audio')}
            className="file-input file-input-bordered w-full"
            disabled={uploadingAudio || assetTypesLoading}
          />
          {assetTypesLoading && <span className="text-sm text-info mt-1">Loading asset types...</span>}
          {uploadingAudio && <span className="text-sm text-info mt-1">Uploading audio...</span>}
        </div>

        {/* Artwork Upload */}
        <div>
          <label className="label">
            <span className="label-text">Artwork File *</span>
            {artworkAssetId && <span className="label-text-alt text-success">✓ Uploaded (ID: {artworkAssetId})</span>}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files?.[0], 'artwork')}
            className="file-input file-input-bordered w-full"
            disabled={uploadingArtwork || assetTypesLoading}
          />
          {assetTypesLoading && <span className="text-sm text-info mt-1">Loading asset types...</span>}
          {uploadingArtwork && <span className="text-sm text-info mt-1">Uploading artwork...</span>}
        </div>

        {/* Optional Fields */}
        <div className="divider text-sm">Optional Fields</div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">
              <span className="label-text">Reff Start (s)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={reffStart}
              onChange={(e) => setReffStart(e.target.value)}
              placeholder="0.0"
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Reff End (s)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={reffEnd}
              onChange={(e) => setReffEnd(e.target.value)}
              placeholder="0.0"
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Reff Duration (s)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={reffDuration}
              onChange={(e) => setReffDuration(e.target.value)}
              placeholder="0.0"
              className="input input-bordered w-full"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="modal-action">
          <button 
            className="btn btn-ghost" 
            onClick={onClose} 
            disabled={loading || uploadingVideo || uploadingAudio || uploadingArtwork}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={loading || uploadingVideo || uploadingAudio || uploadingArtwork}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              'Save Song'
            )}
          </button>
        </div>
      </div>
      <ToastContainer />
    </Modal>
  );
}
