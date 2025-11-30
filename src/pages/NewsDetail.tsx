import React, { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Container from '../components/Container';
import { Button } from '../components/Button';
import { sanitizeHtml } from '../helpers/sanitizeHtml';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchNewsById, updateNews, deleteNews } from '../features/news/newsSlice';
import { fetchNewsTypes } from '../features/newsType/newsTypeSlice';
import type { NewsArticle } from '../features/news/newsSlice';
import Modal from '../components/Modal';
import { useToast } from '../hooks/useToast';
import Wysiwyg from '../components/Wysiwyg';
import { useState } from 'react';
import { uploadAssetWithPresigned } from '../helpers/uploadAsset';

// using shared sanitizeHtml helper from src/helpers/sanitizeHtml

const NewsDetail: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { entities, isLoading, error } = useSelector((s: RootState) => s.news);
  const newsTypes = useSelector((s: RootState) => s.newsTypes.data)

  useEffect(() => {
    if (!id) return;
    dispatch(fetchNewsById(Number(id)));
    if (!newsTypes || newsTypes.length === 0) dispatch(fetchNewsTypes())
  }, [dispatch, id, newsTypes]);

  const article: NewsArticle | undefined = id ? entities[String(id)] : undefined;

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { showToast, ToastContainer } = useToast()
  const [editForm, setEditForm] = useState<{ title: string; content: string; header_image?: string; news_type_id?: string; asset_id?: number }>({ title: '', content: '', header_image: '', news_type_id: 'patch', asset_id: undefined })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!article) return
    setIsSaving(true)
    try {
      await dispatch(updateNews({
        id: article.id,
        title: editForm.title,
        content: editForm.content,
        news_type_id: Number(editForm.news_type_id),
        asset_id: editForm.asset_id ?? article.asset_id,
      })).unwrap()
      setEditOpen(false)
      dispatch(fetchNewsById(article.id))
      showToast('Article updated', 'success')
    } catch (err) {
      console.error('Failed to update article', err)
      showToast('Failed to update article', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!article) return
    setIsDeleting(true)
    try {
      await dispatch(deleteNews(article.id)).unwrap()
      setDeleteOpen(false)
      showToast('Article deleted', 'success')
      navigate('/dashboard/news')
    } catch (err) {
      console.error('Failed to delete article', err)
      showToast('Failed to delete article', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUploadHeaderImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const f = input.files?.[0]
      if (!f) return
      try {
        const asset = await uploadAssetWithPresigned(f, undefined, undefined)
        // store both preview URL and returned asset id so backend can reference the uploaded asset
        setEditForm(s => ({ ...s, header_image: asset.assets_url, asset_id: asset.id }))
        showToast('Header image uploaded', 'success')
      } catch (err) {
        console.error('Header image upload failed', err)
        showToast('Failed to upload image', 'error')
      }
    }
    input.click()
  }

  const newsTypeOptions = useMemo(() => {
    return (newsTypes || []).map(nt => (
      <option key={nt.id} value={String(nt.id)}>{nt.name}</option>
    ))
  }, [newsTypes])

  useEffect(() => {
    if (article) {
      setEditForm(
        { 
          title: article.title ?? '', 
          content: article.content ?? '', 
          header_image: article.header_image ?? '', 
          news_type_id: article.news_type_id?.toString() ?? 'patch', 
          asset_id: article.asset_id 
        }
      )
    }
  }, [article])

  if (isLoading) {
    return (
      <Container>
        <div className="w-full">Loading...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="w-full">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-error mt-2">{error}</p>
          <Link to="/dashboard/news"><Button>Back to news</Button></Link>
        </div>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container>
        <div className="w-full">
          <h1 className="text-2xl font-bold">News not found</h1>
          <Link to="/dashboard/news"><Button>Back to news</Button></Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="w-full max-w-3xl">
        {article.header_image && (
          <img src={article.header_image} alt={article.title} className="w-full h-48 object-cover rounded" />
        )}
        <h1 className="text-3xl font-bold mt-4">{article.title}</h1>
        <p className="text-sm text-content-600">{article.created_at ? new Date(article.created_at).toLocaleString() : ''}</p>
        <div className="mt-4 max-w-none wysiwyg-reset not-prose">
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content ?? '') }} />
        </div>
        <ToastContainer />
        <div className="flex gap-2 justify-end mt-4">
          <Button onClick={() => setEditOpen(true)}>Edit</Button>
          <Button onClick={() => setDeleteOpen(true)} className="btn-error">Delete</Button>
        </div>

        <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm Delete">
          <div className="py-2">
            <p>Are you sure you want to delete this article? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end mt-4">
              <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button className="btn-error" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete'}</Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit News">
          <div className="flex flex-col gap-3">
            <label className="label"><span className="label-text">Title</span></label>
            <input className="input input-bordered w-full" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />

            <label className="label"><span className="label-text">Header image URL</span></label>
            <div className="flex gap-2">
              <input className="input input-bordered flex-1" value={editForm.header_image} onChange={e => setEditForm(f => ({ ...f, header_image: e.target.value, asset_id: undefined }))} />
              <Button onClick={handleUploadHeaderImage}>Upload</Button>
            </div>

            <label className="label"><span className="label-text">Type</span></label>
            <select className="select select-bordered w-full" value={editForm.news_type_id} onChange={e => setEditForm(f => ({ ...f, news_type_id: e.target.value }))}>
              <option value="">Select type</option>
              {newsTypeOptions}
            </select>

            <label className="label"><span className="label-text">Content</span></label>
            <Wysiwyg value={editForm.content} onChange={val => setEditForm(f => ({ ...f, content: val }))} />

            <div className="flex gap-2 justify-end mt-3">
              <Button onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </Modal>
        <div className="mt-6">
          <Link to="/dashboard/news"><Button>Back to news</Button></Link>
        </div>
      </div>
    </Container>
  );
};

export default NewsDetail;
