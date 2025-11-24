import Container from '../components/Container'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/Button'

interface NewsItem {
  id: number;
  title: string;
  news_type: string;
  header_image: string;
  created_at: string;
  preview: string;
}

const dummyData: NewsItem[] = [
  {
    id: 3,
    title: 'Patch 1.3.0 - New Arena Mode',
    news_type: 'patch',
    header_image: 'https://gamecdn.b-cdn.net/mrt-banner.jpeg',
    created_at: '2024-01-15T14:30:00Z',
    preview: "New Arena Mode Live! What's New: New Mode: 5v5 Arena battles; New Maps: 3 arena maps...",
  },
  {
    id: 2,
    title: 'Winter Event Started!',
    news_type: 'event',
    header_image: 'https://gamecdn.b-cdn.net/mrt-banner.jpeg',
    created_at: '2024-01-10T10:15:00Z',
    preview: 'Enjoy the winter event with special rewards! Duration: Dec 15 - Jan 10',
  },
  {
    id: 1,
    title: 'Server Maintenance - Jan 15',
    news_type: 'maintenance',
    header_image: 'https://gamecdn.b-cdn.net/mrt-banner.jpeg',
    created_at: '2024-01-08T09:00:00Z',
    preview: "We'll have server maintenance on January 15, 2:00-4:00 AM UTC. Expected downtime: 2 hours",
  },
]

const News = () => {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')

  const filtered = category ? dummyData.filter(d => d.news_type === category) : dummyData

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

        <div className="flex flex-col gap-4">
          {filtered.map(item => (
            <article key={item.id} className="w-full bg-base-100 rounded shadow-sm border">
              <div className="p-4 md:p-6 flex flex-col md:flex-row items-start gap-4">
                <img src={item.header_image} alt={item.title} className="w-full md:w-40 h-36 md:h-28 object-cover rounded" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="text-xs text-content-600">{new Date(item.created_at).toLocaleString()}</p>
                  <p className="mt-2 text-sm text-content-700">{item.preview}</p>
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