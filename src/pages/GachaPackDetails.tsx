import { useParams } from 'react-router-dom';

const GachaPackDetails = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>Gacha Pack Details for ID: {id}</div>
  )
}

export default GachaPackDetails