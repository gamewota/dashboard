import { Button } from '../components/Button';
import type { BannerTypeItem } from '../features/bannerTypes/bannerTypeSlice';

type Params = {
    canEditBannerType: boolean;
    canDeleteBannerType: boolean;
    openEdit: (row: BannerTypeItem) => void;
    openDelete: (id: number) => void;
};

export function getBannerTypeColumns({
    canEditBannerType,
    canDeleteBannerType,
    openEdit,
    openDelete,
}: Params) {
    return [
        { header: '#', accessor: (_row: BannerTypeItem, i: number) => i + 1 },
        { header: 'ID', accessor: 'id' as keyof BannerTypeItem },
        { header: 'Name', accessor: 'name' as keyof BannerTypeItem },
        { header: 'Created At', accessor: (row: BannerTypeItem) => new Date(row.created_at).toLocaleString() },
        { header: 'Updated At', accessor: (row: BannerTypeItem) => new Date(row.updated_at).toLocaleString() },
        { 
            header: 'Actions', 
            accessor: (row: BannerTypeItem) => (
                <div className="flex gap-2">
                    {canEditBannerType && (
                        <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>Edit</Button>
                    )}
                    {canDeleteBannerType && (
                        <Button size="sm" variant="error" onClick={() => openDelete(row.id)}>Delete</Button>
                    )}
                </div>
            )
        },
    ];
}
