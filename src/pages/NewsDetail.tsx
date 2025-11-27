import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '../components/Container';
import { Button } from '../components/Button';
import DOMPurify from 'dompurify';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchNewsById } from '../features/news/newsSlice';
import type { NewsArticle } from '../features/news/newsSlice';

function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html);
}

const NewsDetail: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { entities, isLoading, error } = useSelector((s: RootState) => s.news);

  useEffect(() => {
    if (!id) return;
    // Request the article from the API via the existing thunk
    dispatch(fetchNewsById(Number(id)));
  }, [dispatch, id]);

  const article: NewsArticle | undefined = id ? entities[String(id)] : undefined;

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
        <div className="mt-4 prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content ?? '') }} />
        </div>
        <div className="mt-6">
          <Link to="/dashboard/news"><Button>Back to news</Button></Link>
        </div>
      </div>
    </Container>
  );
};

export default NewsDetail;
