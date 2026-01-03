import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Container from '../components/Container'
import { DataTable } from '../components/DataTable'
import { fetchCardVariants, selectCardVariants, selectCardVariantsLoading, selectCardVariantsError } from '../features/cardVariants/cardVariantSlice'
import type { AppDispatch } from '../store'

const CardVariant = () => {
  const dispatch = useDispatch<AppDispatch>()
  const cardVariants = useSelector(selectCardVariants)
  const loading = useSelector(selectCardVariantsLoading)
  const error = useSelector(selectCardVariantsError)

  useEffect(() => {
    dispatch(fetchCardVariants())
  }, [dispatch])

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Variant Name', accessor: 'variant_name' as const },
    { header: 'Variant Value', accessor: 'variant_value' as const },
  ]

  console.log('cardVariants', cardVariants)

  return (
    <Container>
      <div className="overflow-x-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center">Card Variants</h1>
      </div>
        <DataTable columns={columns} data={cardVariants} loading={loading} error={error} />
      </div>
    </Container>
  )
}

export default CardVariant