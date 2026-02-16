import Container from '../components/Container'
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import type { MemberType } from '../features/members/membersSlice';
import { fetchMembers } from '../features/members/membersSlice';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
};

const Member = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.members);

  const columns : Column<MemberType>[] = [
    { header: '#', accessor: (_row: MemberType, i: number) => i + 1 as React.ReactNode },
    { header: 'Member Name', accessor: 'member_name' },
    { header: 'Stage Name', accessor: (row: MemberType) => row.stage_name ?? '-' },
    { header: 'Profile URL', accessor: (row: MemberType) => row.profile_url ? <a href={row.profile_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Profile</a> : '-' },
    { header: 'Birth Date', accessor: (row: MemberType) => row.birth_date ? (moment(row.birth_date).isValid() ? <span className="whitespace-nowrap">{moment(row.birth_date).format('DD-MM-YYYY')}</span> : '-') : '-' },
    { header: 'Blood Type', accessor: (row: MemberType) => row.blood_type ?? '-' },
    { header: 'Zodiac', accessor: (row: MemberType) => row.zodiac ?? '-' },
    { header: 'Height', accessor: (row: MemberType) => row.height ?? '-' },
    { header: 'Current Photo', accessor: (row: MemberType) => row.current_photo_url ? <img src={row.current_photo_url} alt={row.member_name} className="h-16 w-16 object-cover rounded" /> : '-' },
    { header: 'Is Active', accessor: (row: MemberType) => row.is_active ? 'Active' : 'Inactive' },
    { header: 'Created At', accessor: (row: MemberType) => row.created_at ? (moment(row.created_at).isValid() ? <span className="whitespace-nowrap">{moment(row.created_at).format('DD-MM-YYYY')}</span> : '-') : '-' },
    { header: 'Updated At', accessor: (row: MemberType) => row.updated_at ? (moment(row.updated_at).isValid() ? <span className="whitespace-nowrap">{moment(row.updated_at).format('DD-MM-YYYY')}</span> : '-') : '-' },
    { header: 'Deleted At', accessor: (row: MemberType) => row.deleted_at ? (moment(row.deleted_at).isValid() ? <span className="whitespace-nowrap">{moment(row.deleted_at).format('DD-MM-YYYY')}</span> : '-') : '-' },
  ];


  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);


  if (loading) return (
    <div className='min-h-screen w-screen flex justify-center items-center'>
      <p>Loading...</p>
    </div>
  )
  if (error) return (
    <div className='min-h-screen w-screen flex justify-center items-center'>
      <p className='text-bold'>Error: {error}</p>
    </div>
  )
  if (!data || data.length === 0) return (
    <div className='min-h-screen w-screen flex justify-center items-center'>
      <p>No members found.</p>
    </div>
  )

  return (
    <Container>
      <div className='overflow-x-auto'>
        <DataTable 
          data={data}
          loading={loading}
          error={error}
          emptyMessage={'No members found.'}
          columns={columns}
        />
      </div>
    </Container>
  )
}

export default Member