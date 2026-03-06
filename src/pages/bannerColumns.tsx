import { Button } from '../components/Button';
import type { Banner } from '../lib/schemas/banner';

type Params = {
    canEditBanner: boolean;
    canDeleteBanner: boolean;
    openEdit: (row: Banner) => void;
    openDelete: (id: number) => void;
    openDetails: (id: number) => void;
};

export function getBannerColumns({
    canEditBanner,
    canDeleteBanner,
    openEdit,
    openDelete,
    openDetails,
}: Params) {
    return [
        { header: '#', accessor: (_row: Banner, i: number) => i + 1 },
        { header: 'ID', accessor: 'id' as keyof Banner },
        { header: 'Name', accessor: 'name' as keyof Banner },
        { 
            header: 'Banner Type', 
            accessor: (row: Banner) => row.banner_type_name 
        },
        { 
            header: 'Start Date', 
            accessor: (row: Banner) => new Date(row.start_at).toLocaleString() 
        },
        { 
            header: 'End Date', 
            accessor: (row: Banner) => new Date(row.end_at).toLocaleString() 
        },
        { 
            header: 'Status',
            accessor: (row: Banner) => {
                const now = new Date();
                const start = new Date(row.start_at);
                const end = new Date(row.end_at);
                if (now < start) {
                    return <span className="badge badge-warning">Upcoming</span>;
                } else if (now > end) {
                    return <span className="badge badge-error">Expired</span>;
                } else {
                    return <span className="badge badge-success">Active</span>;
                }
            }
        },
        { 
            header: 'Actions', 
            accessor: (row: Banner) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="info" onClick={() => openDetails(row.id)}>
                        Details
                    </Button>
                    {canEditBanner && (
                        <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
                            Edit
                        </Button>
                    )}
                    {canDeleteBanner && (
                        <Button size="sm" variant="error" onClick={() => openDelete(row.id)}>
                            Delete
                        </Button>
                    )}
                </div>
            )
        },
    ];
}
