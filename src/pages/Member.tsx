import Container from '../components/Container'
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
    { header: 'Member Name', accessor: (row: MemberType) => row.member_name || '-' },
    { header: 'Is Active', accessor: (row: MemberType) => row.is_active ? 'Active' : 'Inactive' },
    { header: 'Created At', accessor: (row: MemberType) => row.created_at || '-' },
    { header: 'Updated At', accessor: (row: MemberType) => row.updated_at || '-' },
    { header: 'Deleted At', accessor: (row: MemberType) => row.deleted_at ?? '-' },
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
      <p>No items found.</p>
    </div>
  )

  return (
    <Container>
      <div className='overflow-x-auto'>
        <DataTable 
          data={data}
          loading={loading}
          error={error}
          emptyMessage={'No cards found.'}
          columns={columns}
        />
      </div>
    </Container>
  )
}

export default Member