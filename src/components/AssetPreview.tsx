import { useEffect, useState } from 'react';
import Modal from './Modal';
import { Button } from './Button';
import { useToast } from '../hooks/useToast';
import type { AssetItem } from '../features/assets/assetsSlice';

interface Props {
  preview: { item: AssetItem; type: string } | null;
  onClose: () => void;
}

export default function AssetPreview({ preview, onClose }: Props) {
  const { showToast } = useToast();
  const [jsonContent, setJsonContent] = useState<string | null>(null);
  const [jsonLoading, setJsonLoading] = useState(false);

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
        .finally(() => {
          if (!cancelled) setJsonLoading(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [preview, showToast]);

  return (
    <Modal
      isOpen={!!preview}
      onClose={onClose}
      title={preview ? `Preview asset #${preview.item.id}` : undefined}
      footer={<Button onClick={onClose}>Close</Button>}
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
  );
}
