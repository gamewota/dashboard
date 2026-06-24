import { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'
import Container from '../components/Container'
import { DataTable } from '../components/DataTable'
import { Button } from '../components/Button'
import Modal from '../components/Modal'
import { useToast } from '../hooks/useToast'
import { uploadAssetWithPresigned } from '../helpers/uploadAsset'
import { ASSET_TYPE } from '../helpers/assetTypes'
import { createProfileBanner, fetchProfileBanners } from '../features/profileBanner/profileBannerSlice'
import type { ProfileBanner as ProfileBannerType } from '../lib/schemas/profileBanner'
import type { RootState, AppDispatch } from '../store'

type Column<T> = {
  header: string
  accessor: keyof T | ((row: T, index: number) => React.ReactNode)
}

const formatDate = (value?: string) =>
  value && moment(value).isValid()
    ? <span className="whitespace-nowrap">{moment(value).format('DD-MM-YYYY')}</span>
    : '-'

const columns: Column<ProfileBannerType>[] = [
  { header: '#', accessor: (_row, i) => (i + 1) as React.ReactNode },
  {
    header: 'Image',
    accessor: (row) =>
      row.image_url
        ? <img src={row.image_url} alt={row.name} className="h-16 w-28 object-cover rounded" />
        : '-',
  },
  { header: 'Name', accessor: 'name' },
  { header: 'Default', accessor: (row) => (row.is_default ? 'Yes' : 'No') },
  { header: 'Created At', accessor: (row) => formatDate(row.created_at) },
  { header: 'Updated At', accessor: (row) => formatDate(row.updated_at) },
]

const emptyForm = { name: '', asset_id: 0, is_default: false, previewUrl: '' }

const ProfileBanner = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { banners, loading, error } = useSelector((state: RootState) => state.profileBanners)
  const { showToast, ToastContainer } = useToast()

  const isMountedRef = useRef(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    isMountedRef.current = true
    dispatch(fetchProfileBanners())
    return () => {
      isMountedRef.current = false
    }
  }, [dispatch])

  const openCreate = () => {
    setForm(emptyForm)
    setIsCreateOpen(true)
  }

  const handleFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      setIsUploading(true)
      try {
        const asset = await uploadAssetWithPresigned(file, undefined, undefined, ASSET_TYPE.BANNER_ARTWORK)
        if (!isMountedRef.current) return
        setForm((prev) => ({ ...prev, asset_id: asset.id, previewUrl: asset.assets_url }))
        showToast('Image uploaded', 'success')
      } catch (err) {
        console.error('Asset upload failed', err)
        if (isMountedRef.current) showToast('Failed to upload image', 'error')
      } finally {
        if (isMountedRef.current) setIsUploading(false)
      }
    }
    input.click()
  }

  const handleCreate = async () => {
    if (!form.name.trim()) {
      showToast('Name is required', 'error')
      return
    }
    if (!form.asset_id) {
      showToast('Image is required', 'error')
      return
    }

    setIsSaving(true)
    try {
      await dispatch(
        createProfileBanner({
          name: form.name.trim(),
          asset_id: form.asset_id,
          is_default: form.is_default,
        }),
      ).unwrap()
      if (!isMountedRef.current) return
      showToast('Profile banner created', 'success')
      setIsCreateOpen(false)
      dispatch(fetchProfileBanners())
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Failed to create profile banner'
      if (isMountedRef.current) showToast(message, 'error')
    } finally {
      if (isMountedRef.current) setIsSaving(false)
    }
  }

  return (
    <Container justify="start">
      <div className="w-full overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Profile Banners</h1>
          <Button variant="primary" onClick={openCreate}>
            Add Profile Banner
          </Button>
        </div>

        <DataTable
          data={banners}
          loading={loading}
          error={error}
          emptyMessage="No profile banners found."
          columns={columns}
        />
      </div>

      <Modal
        title="Add Profile Banner"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} disabled={isSaving || isUploading}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="form-control w-full">
            <span className="label-text mb-1">Name</span>
            <input
              type="text"
              className="input input-bordered w-full"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Banner name"
            />
          </label>

          <div className="form-control w-full">
            <span className="label-text mb-1">Image</span>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleFileUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </Button>
              {form.asset_id ? (
                <span className="text-sm text-gray-500">asset #{form.asset_id}</span>
              ) : null}
            </div>
            {form.previewUrl ? (
              <img src={form.previewUrl} alt="Preview" className="mt-3 h-24 w-44 object-cover rounded" />
            ) : null}
          </div>

          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm((prev) => ({ ...prev, is_default: e.target.checked }))}
            />
            <span className="label-text">Set as default</span>
          </label>
        </div>
      </Modal>

      <ToastContainer />
    </Container>
  )
}

export default ProfileBanner
