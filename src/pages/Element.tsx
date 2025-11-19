import { useEffect } from 'react'
import Container from '../components/Container'
import { useDispatch, useSelector } from 'react-redux';
import { fetchElements } from '../features/elements/elementSlice';
import type { RootState, AppDispatch } from '../store';

const Element = () => {
  const dispatch = useDispatch<AppDispatch>();
  const elements = useSelector((state: RootState) => state.elements.data ?? []);
  const loading = useSelector((state: RootState) => state.elements.loading);
  const error = useSelector((state: RootState) => state.elements.error);

  useEffect(() => {
    dispatch(fetchElements());
  }, [dispatch]);

  return (
    <Container className="flex-col items-start">
      <h1 className="text-2xl font-bold mb-4">Elements</h1>

      {loading && (
        <div className='flex items-center'>
          <span className="loading loading-spinner" />
          <span className="ml-2">Loading elements...</span>
        </div>
      )}

      {error && (
        <div className='text-error'>Error: {error}</div>
      )}

      {!loading && !error && elements.length === 0 && (
        <div>No elements found.</div>
      )}

      {!loading && !error && elements.length > 0 && (
        <div className="grid gap-2">
          {elements.map((el, idx) => (
            <div key={idx} className="p-2 bg-base-200 rounded">
              {typeof el === 'object' ? JSON.stringify(el) : String(el)}
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}

export default Element