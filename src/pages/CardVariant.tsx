import { useEffect, Suspense } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ErrorBoundary } from 'react-error-boundary'
import Container from '../components/Container'
import { DataTable } from '../components/DataTable'
import { ErrorFallback } from '../components/ErrorFallback'
import { LoadingFallback } from '../components/LoadingFallback'
import { fetchCardVariants, selectCardVariants } from '../features/cardVariants/cardVariantSlice'
import type { AppDispatch } from '../store'

function CardVariantTable() {
  const cardVariants = useSelector(selectCardVariants)

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Variant Name', accessor: 'variant_name' as const },
    { header: 'Variant Value', accessor: 'variant_value' as const },
  ]

  return <DataTable columns={columns} data={cardVariants} />
}

function CardVariantContent() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchCardVariants())
  }, [dispatch])

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <CardVariantTable />
      </Suspense>
    </ErrorBoundary>
  )
}

const CardVariant = () => {
  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Card Variants</h1>
      </div>
      <CardVariantContent />
    </Container>
  )
}

export default CardVariant