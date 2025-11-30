import Container from '../components/Container'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { fetchNews, createNews } from '../features/news/newsSlice'
import { fetchNewsTypes } from '../features/newsType/newsTypeSlice'
import type { NewsArticle } from '../features/news/newsSlice'
import { stripHtml } from '../helpers/sanitizeHtml'
import Modal from '../components/Modal'
import Wysiwyg from '../components/Wysiwyg'
import { uploadAssetWithPresigned } from '../helpers/uploadAsset'

const News = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')

  const { entities, ids, isLoading, error } = useSelector((s: RootState) => s.news)
  const newsTypes = useSelector((s: RootState) => s.newsTypes.data)
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState<{ title: string; content: string; header_image?: string; news_type_id?: number; asset_id?: number }>({ title: '', content: '', header_image: '', news_type_id: undefined, asset_id: undefined })

  useEffect(() => {
    dispatch(fetchNews())
    dispatch(fetchNewsTypes())
  }, [dispatch])

  // set default news_type_id when types load
  useEffect(() => {
    if ((form.news_type_id === undefined || form.news_type_id === null) && newsTypes && newsTypes.length > 0) {
      setForm(f => ({ ...f, news_type_id: newsTypes[0].id }))
    }
  }, [newsTypes, form.news_type_id])

  const list = ids.map(id => entities[id]).filter(Boolean) as NewsArticle[]
  const filtered = category ? list.filter(d => d.news_type === category) : list

  return (
    <Container>
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">News</h1>
          <div className="flex gap-2">
            <Link to="/dashboard/news">
              <Button size="sm">All</Button>
            </Link>
            <Link to="/dashboard/news?category=patch">
              <Button size="sm">Patch</Button>
            </Link>
            <Link to="/dashboard/news?category=event">
              <Button size="sm">Event</Button>
            </Link>
            <Link to="/dashboard/news?category=maintenance">
              <Button size="sm">Maintenance</Button>
            </Link>
            <Button size="sm" onClick={() => setCreateOpen(true)}>Create</Button>
          </div>
        </div>

        <Modal isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} title="Create News">
          <div className="flex flex-col gap-3">
            <label className="label"><span className="label-text">Title</span></label>
            <input className="input input-bordered w-full" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

            <label className="label"><span className="label-text">Header image URL</span></label>
            <div className="flex gap-2">
              <input className="input input-bordered flex-1" value={form.header_image} onChange={e => setForm(f => ({ ...f, header_image: e.target.value }))} />
              <Button onClick={async () => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = async () => {
                  const f = input.files?.[0]
                  if (!f) return
                  const asset = await uploadAssetWithPresigned(f, undefined, undefined)
                  // store both URL for preview and asset id for backend
                  setForm(s => ({ ...s, header_image: asset.assets_url, asset_id: asset.id }))
                }
                input.click()
              }}>Upload</Button>
            </div>

            <label className="label"><span className="label-text">Type</span></label>
            <select className="select select-bordered w-full" value={form.news_type_id ?? ''} onChange={e => setForm(f => ({ ...f, news_type_id: e.target.value ? Number(e.target.value) : undefined }))}>
              <option value="">Select type</option>
              {newsTypes.map(nt => (
                <option key={nt.id} value={nt.id}>{nt.name}</option>
              ))}
            </select>

            <label className="label"><span className="label-text">Content</span></label>
            <Wysiwyg value={form.content} onChange={val => setForm(f => ({ ...f, content: val }))} />

            <div className="flex gap-2 justify-end mt-3">
              <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!form.title || !form.content) return
                // send news_type_id and asset_id to backend (asset_id references uploaded asset)
                try {
                  // unwrap to throw on rejection so we can handle errors
                  await dispatch(createNews({ title: form.title, content: form.content, news_type_id: form.news_type_id, asset_id: form.asset_id })).unwrap()
                  // refresh list after successful create
                  dispatch(fetchNews())
                  setCreateOpen(false)
                  setForm({ title: '', content: '', header_image: '', news_type_id: undefined, asset_id: undefined })
                } catch (err) {
                  console.error('Failed to create news', err)
                }
              }}>Create</Button>
            </div>
          </div>
        </Modal>

        {isLoading && <div className="mb-4">Loading...</div>}
        {error && <div className="mb-4 text-error">Error: {error}</div>}

        <div className="flex flex-col gap-4">
          {filtered.map(item => (
            <article key={item.id} className="w-full bg-base-100 rounded shadow-sm border">
              <div className="p-4 md:p-6 flex flex-col md:flex-row items-start gap-4">
                <img src={item.header_image} alt={item.title} className="w-full md:w-40 h-36 md:h-28 object-cover rounded" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="text-xs text-content-600">{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</p>
                  <p className="mt-2 text-sm text-content-700">{stripHtml(item.content).slice(0, 200)}</p>
                  <div className="mt-3">
                    <Link to={`/dashboard/news/${item.id}`}>
                      <Button size="sm">Read more</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Container>
  )
}

export default News