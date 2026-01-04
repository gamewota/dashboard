import { Suspense, useEffect } from 'react'
import Container from '../components/Container'
import type { GachaPack as GachaPackType } from '../features/cards/gachaPackSlice'
import { useDispatch, useSelector } from 'react-redux';
import { fetchGachaPacks } from '../features/cards/gachaPackSlice';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingFallback } from '../components/LoadingFallback';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';


function GachaPackTable({ packs }: { packs: GachaPackType[] }) {
  const navigate = useNavigate()
  const columns = [
    {header: '#', accessor: (row: GachaPackType) => <Button size='xs' onClick={() => navigate(`/dashboard/cards/gacha-pack/${row.id}`)} variant='info'>Detail</Button>},
    { header: 'ID', accessor: 'id' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Price', accessor: 'price' as const },
    { header: 'Currency', accessor: (row: GachaPackType) => (row.currency_name == null ? '-' : String(row.currency_name)) },
    { header: 'Item', accessor: (row: GachaPackType) => (row.item_name == null ? '-' : String(row.item_name)) },
  ]

  return <ErrorBoundary FallbackComponent={() => <div>Error loading gacha packs.</div>}> 
  <Suspense fallback={<div>Loading...</div>}>
    <DataTable columns={columns} data={packs} />
  </Suspense>
  </ErrorBoundary>;
}


const GachaPack = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: gachaPacks = [], loading, error } = useSelector((state: RootState) => state.gachaPack);

  useEffect(() => {
    dispatch(fetchGachaPacks());
  }, [dispatch]);

  if (loading) {
    return (
      <Container>
        <LoadingFallback />
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div className="alert alert-error shadow-lg">
          <div>
            <span className="font-semibold">Failed to load gacha packs</span>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      </Container>
    )
  }

  if (!gachaPacks || gachaPacks.length === 0) {
    return (
      <Container>
        <div className="py-12 text-center text-sm text-content-400">No gacha packs available.</div>
      </Container>
    )
  }

  return (
    <Container>
      <div>
        <div className='mb-6'>
            <h1 className='text-3xl font-bold'>Gacha Packs</h1>
        </div>
        <GachaPackTable packs={gachaPacks} />
      </div>
    </Container>
  )
}

export default GachaPack