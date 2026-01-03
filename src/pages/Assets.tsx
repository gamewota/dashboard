import React, { useEffect, useState, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import Container from '../components/Container'
import { DataTable } from '../components/DataTable'
import { ErrorFallback } from '../components/ErrorFallback'
import { LoadingFallback } from '../components/LoadingFallback'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { fetchAssets } from '../features/assets/assetsSlice'
import type { AssetItem } from '../features/assets/assetsSlice'
import { useToast } from '../hooks/useToast'
import { Button } from '../components/Button'
import AssetPreview from '../components/AssetPreview'

function detectType(url: string) {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
  const imageExt = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']
  const audioExt = ['mp3', 'wav', 'ogg', 'm4a']
  const videoExt = ['mp4', 'webm', 'ogg']
  if (imageExt.includes(ext)) return 'image'
  if (audioExt.includes(ext)) return 'audio'
  if (videoExt.includes(ext)) return 'video'
  if (ext === 'json') return 'json'
  return 'other'
}

function AssetsTable({ setPreview }: { setPreview: (p: { item: AssetItem; type: string }) => void }) {
  const { data } = useSelector((s: RootState) => s.assets)

  const columns = [
    { header: '#', accessor: (_r: AssetItem, i: number) => i + 1 },
    {
      header: 'Preview',
      accessor: (row: AssetItem) => {
        const t = detectType(row.assets_url)
        if (t === 'image') {
          const meta = row as unknown as Record<string, unknown>
          const nameFromMeta = typeof meta.name === 'string' ? meta.name : (typeof meta.title === 'string' ? meta.title : (typeof meta.filename === 'string' ? meta.filename : undefined))
          const filenameFromUrl = row.assets_url.split('/').pop()?.split('?')[0]
          const altText = nameFromMeta ? `${nameFromMeta} (asset ${row.id})` : (filenameFromUrl ? `${filenameFromUrl} (asset ${row.id})` : `asset ${row.id}`)
          return <img src={row.assets_url} alt={altText} className="w-20 h-20 object-cover rounded" />
        }
        return <div className="w-20 h-20 flex items-center justify-center bg-base-200 rounded text-sm">{t.toUpperCase()}</div>
      },
    },
    { header: 'Type', accessor: (row: AssetItem) => detectType(row.assets_url) },
    { header: 'URL', accessor: (row: AssetItem) => <a href={row.assets_url} target="_blank" rel="noreferrer" className="underline">Open</a> },
    { header: 'Created At', accessor: (row: AssetItem) => row.created_at ? new Date(row.created_at).toLocaleString() : '-' },
    { header: 'Updated At', accessor: (row: AssetItem) => row.updated_at ? new Date(row.updated_at).toLocaleString() : '-' },
    { header: 'Actions', accessor: (row: AssetItem) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setPreview({ item: row, type: detectType(row.assets_url) })}>Preview</Button>
      </div>
    ) },
  ]

  return <DataTable columns={columns} data={data || []} rowKey={'id'} emptyMessage={'No assets found.'} />
}

function AssetsContent({ setPreview }: { setPreview: (p: { item: AssetItem; type: string }) => void }) {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchAssets())
  }, [dispatch])

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <AssetsTable setPreview={setPreview} />
      </Suspense>
    </ErrorBoundary>
  )
}

const AssetsPage: React.FC = () => {
  const { ToastContainer } = useToast()
  const [preview, setPreview] = useState<null | { item: AssetItem; type: string }>(null)

  return (
    <Container className="flex-col items-center p-4">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Assets</h1>
        </div>

        <AssetsContent setPreview={setPreview} />

        <AssetPreview preview={preview} onClose={() => setPreview(null)} />

        <ToastContainer />
      </div>
    </Container>
  )
}

export default AssetsPage
