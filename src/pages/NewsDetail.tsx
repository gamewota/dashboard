import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '../components/Container';
import { Button } from '../components/Button';
import DOMPurify from 'dompurify';

type NewsDetailResp = {
  success: boolean;
  news: {
    id: number;
    title: string;
    content: string; // HTML string
    news_type: string;
    header_image: string;
    created_at: string;
  };
};

const dummyData = {
  id: 3,
  title: 'Patch 1.3.0 - New Arena Mode',
  content:
    '<h1>New Arena Mode Live!</h1><h2>What\'s New</h2><ul><li><strong>New Mode:</strong> 5v5 Arena battles</li><li><strong>New Maps:</strong> 3 arena maps</li><li><strong>Rank System:</strong> Competitive ranking</li></ul><h2>Balance Changes</h2><ul><li>Warrior damage +5%</li><li>Mage cooldowns reduced</li><li>Archer range increased by 10%</li></ul><h2>Bug Fixes</h2><ul><li>Fixed crash when using ultimate skills</li><li>Fixed item duplication exploit</li><li>Fixed matchmaking issues</li></ul>',
  news_type: 'patch',
  header_image: 'https://gamecdn.b-cdn.net/mrt-banner.jpeg',
  created_at: '2024-01-15T14:30:00Z',
};

// Use DOMPurify to sanitize HTML from the backend
function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html);
}

const NewsDetail: React.FC = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NewsDetailResp['news'] | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // Use local dummy data only — no API calls for now
    const match = dummyData.id === Number(id) ? dummyData : null;
    setData(match);
    setLoading(false);
  }, [id]);

  if (loading) return <Container><div>Loading...</div></Container>;

  if (!data) return (
    <Container>
      <div className="w-full">
        <h1 className="text-2xl font-bold">News not found</h1>
        <Link to="/dashboard/news"><Button>Back to news</Button></Link>
      </div>
    </Container>
  );

  return (
    <Container>
      <div className="w-full max-w-3xl">
        <img src={data.header_image} alt={data.title} className="w-full h-48 object-cover rounded" />
        <h1 className="text-3xl font-bold mt-4">{data.title}</h1>
        <p className="text-sm text-content-600">{new Date(data.created_at).toLocaleString()}</p>
        <div className="mt-4 prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.content) }} />
        </div>
        <div className="mt-6">
          <Link to="/dashboard/news"><Button>Back to news</Button></Link>
        </div>
      </div>
    </Container>
  );
};

export default NewsDetail;
