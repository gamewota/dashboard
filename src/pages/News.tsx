import Container from '../components/Container'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { fetchNews } from '../features/news/newsSlice'
import type { NewsArticle } from '../features/news/newsSlice'
import DOMPurify from 'dompurify'

function stripHtml(html = '') {
  // Use DOMPurify to sanitize and remove tags. Configure with no allowed tags
  // so the result is plain text. DOMPurify will also neutralize dangerous
  // constructs before stripping tags.
  try {
    return DOMPurify.sanitize(html ?? '', { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
  } catch {
    // Fallback to regex if DOMPurify fails for any reason
    return String(html).replace(/<[^>]*>/g, '')
  }
}

const News = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')

  const { entities, ids, isLoading, error } = useSelector((s: RootState) => s.news)

  useEffect(() => {
    dispatch(fetchNews())
  }, [dispatch])

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
          </div>
        </div>

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