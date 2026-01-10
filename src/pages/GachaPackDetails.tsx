import { Suspense, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import Container from '../components/Container';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGachaPacksDetail, fetchGachaPackById } from '../features/cards/gachaPackSlice';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';
import { LoadingFallback } from '../components/LoadingFallback';
import type { GachaPackDetail as GachaPackDetailType } from '../features/cards/gachaPackSlice';
import { ErrorBoundary } from 'react-error-boundary';



function GachaPackDetailTable({ packs }: { packs: GachaPackDetailType[] }) {
  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'URL', accessor: 'url' as const },
    { header: 'Cards Variant', accessor: 'variant_name' as const },
    { header: 'Rarity', accessor: 'rarity_name' as const },
    { header: 'Element', accessor: 'element_name' as const },
    { header: 'Member', accessor: 'member_name' as const },
  ]

  return <ErrorBoundary FallbackComponent={() => <div>Error loading gacha packs.</div>}> 
  <Suspense fallback={<div>Loading...</div>}>
    <DataTable columns={columns} data={packs} />
  </Suspense>
  </ErrorBoundary>;
}


const GachaPackDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { details: gachaPackDetails = [], loading, error, list: gachaPacks = [] } = useSelector((state: RootState) => state.gachaPack);
  const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
      dispatch(fetchGachaPacksDetail(Number(id)));
      dispatch(fetchGachaPackById(Number(id)));
    }, [dispatch, id]);

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

    if (!gachaPackDetails || gachaPackDetails.length === 0) {
      return (
        <Container>
          <div className="py-12 text-center text-sm text-content-400">Gacha Packs Not Available.</div>
        </Container>
      )
    }


  return (
    <Container>
      <div>
        <div className='mb-6'>
          <div>Gacha Pack Details for: {gachaPacks[0].name}</div>
        </div>
        <GachaPackDetailTable packs={gachaPackDetails} />
      </div>
    </Container>
  )
}

export default GachaPackDetails