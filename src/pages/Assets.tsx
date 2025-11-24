import React, { useEffect, useState } from 'react';
import Container from '../components/Container';
import { DataTable } from '../components/DataTable';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchAssets } from '../features/assets/assetsSlice';
import type { AssetItem } from '../features/assets/assetsSlice';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import Modal from '../components/Modal';

function detectType(url: string) {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
  const imageExt = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
  const audioExt = ['mp3', 'wav', 'ogg', 'm4a'];
  const videoExt = ['mp4', 'webm', 'ogg'];
  if (imageExt.includes(ext)) return 'image';
  if (audioExt.includes(ext)) return 'audio';
  if (videoExt.includes(ext)) return 'video';
  if (ext === 'json') return 'json';
  return 'other';
}

const AssetsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((s: RootState) => s.assets);
  const { showToast, ToastContainer } = useToast();

  const [preview, setPreview] = useState<null | { item: AssetItem; type: string }>(null);
  const [jsonContent, setJsonContent] = useState<string | null>(null);
  const [jsonLoading, setJsonLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAssets());
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    if (preview && preview.type === 'json') {
      setJsonLoading(true);
      setJsonContent(null);
      fetch(preview.item.assets_url)
        .then(async (res) => {
          if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
          const txt = await res.text();
          if (!cancelled) {
            try {
              const parsed = JSON.parse(txt);
              setJsonContent(JSON.stringify(parsed, null, 2));
            } catch {
              setJsonContent(txt);
            }
          }
        })
        .catch((err) => {
          if (!cancelled) showToast?.(String(err), 'error');
        })
        .finally(() => { if (!cancelled) setJsonLoading(false); });
    }
    return () => { cancelled = true; };
  }, [preview, showToast]);

  const columns = [
    { header: '#', accessor: (_r: AssetItem, i: number) => i + 1 },
    {
      header: 'Preview',
      accessor: (row: AssetItem) => {
        const t = detectType(row.assets_url);
        if (t === 'image') {
          const meta = row as unknown as Record<string, unknown>;
          const nameFromMeta = typeof meta.name === 'string' ? meta.name : (typeof meta.title === 'string' ? meta.title : (typeof meta.filename === 'string' ? meta.filename : undefined));
          const filenameFromUrl = row.assets_url.split('/').pop()?.split('?')[0];
          const altText = nameFromMeta ? `${nameFromMeta} (asset ${row.id})` : (filenameFromUrl ? `${filenameFromUrl} (asset ${row.id})` : `asset ${row.id}`);
          return <img src={row.assets_url} alt={altText} className="w-20 h-20 object-cover rounded" />;
        }
        // show small icon or filename
        return <div className="w-20 h-20 flex items-center justify-center bg-base-200 rounded text-sm">{t.toUpperCase()}</div>;
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
  ];

  return (
    <Container className="flex-col items-center p-4">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Assets</h1>
        </div>

        <DataTable columns={columns} data={data || []} rowKey={'id'} loading={loading} error={error} emptyMessage={'No assets found.'} />

        <Modal
          isOpen={!!preview}
          onClose={() => setPreview(null)}
          title={preview ? `Preview asset #${preview.item.id}` : undefined}
          footer={<Button onClick={() => setPreview(null)}>Close</Button>}
        >
          {preview && (
            <div>
              {preview.type === 'image' && (() => {
                const item = preview.item;
                const meta = item as unknown as Record<string, unknown> | undefined;
                const nameFromMeta = meta ? (typeof meta.name === 'string' ? meta.name : (typeof meta.title === 'string' ? meta.title : (typeof meta.filename === 'string' ? meta.filename : undefined))) : undefined;
                const filenameFromUrl = item?.assets_url.split('/').pop()?.split('?')[0];
                const idPart = item?.id ? `asset ${item.id}` : 'asset';
                const altText = nameFromMeta ? `${nameFromMeta} (${idPart})` : (filenameFromUrl ? `${filenameFromUrl} (${idPart})` : idPart);
                return <img src={item?.assets_url} alt={altText} className="max-w-full max-h-[60vh]" />;
              })()}
              {preview.type === 'audio' && <audio controls src={preview.item.assets_url} className="w-full" />}
              {preview.type === 'video' && <video controls src={preview.item.assets_url} className="w-full max-h-[60vh]" />}
              {preview.type === 'json' && (
                <div>
                  {jsonLoading && <div>Loading JSON...</div>}
                  {!jsonLoading && jsonContent && (
                    <pre className="whitespace-pre-wrap max-h-[60vh] overflow-auto bg-base-200 p-4">{jsonContent}</pre>
                  )}
                  {!jsonLoading && !jsonContent && (
                    <div className="text-sm">No preview available. <a href={preview.item.assets_url} target="_blank" rel="noreferrer" className="underline">Open</a></div>
                  )}
                </div>
              )}
              {preview.type === 'other' && (
                <div>
                  <a href={preview.item.assets_url} target="_blank" rel="noreferrer" className="underline">Open asset in new tab</a>
                </div>
              )}
            </div>
          )}
        </Modal>

        <ToastContainer />
      </div>
    </Container>
  );
};

export default AssetsPage;
