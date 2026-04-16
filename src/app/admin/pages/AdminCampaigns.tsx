import { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import {
  fetchAdminCampaigns,
  fetchCampaignInquiries,
  fetchCampaignSupports,
  updateCampaignStatus,
} from '../services/adminApi';
import type {
  AdminCampaignItem,
  AdminInquiryItem,
  AdminSupportItem,
} from '../services/adminApi';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Mail,
  Calendar,
  Tag,
  Megaphone,
} from 'lucide-react';

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
    ?.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

function resolveImageUrl(value: string | null | undefined): string {
  if (!value || !value.trim()) return '';
  const v = value.trim();
  if (/^(https?:|data:|blob:)/i.test(v)) return v;
  const normalized = v.replace(/\\/g, '/');
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  if (normalized.startsWith('/')) return `${origin}${normalized}`;
  if (normalized.includes('/'))
    return `${origin}/${normalized.replace(/^\.\//, '')}`;
  return `${origin}/uploads/${normalized}`;
}

function ColumnFilter({ column }: { column: any }) {
  const columnFilterValue = column.getFilterValue() ?? '';
  return (
    <input
      type="text"
      value={columnFilterValue as string}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      placeholder="Filter..."
      className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
    />
  );
}

const statusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export function AdminCampaigns() {
  const [data, setData] = useState<AdminCampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selected, setSelected] = useState<AdminCampaignItem | null>(null);
  const [inquiries, setInquiries] = useState<AdminInquiryItem[]>([]);
  const [supports, setSupports] = useState<AdminSupportItem[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    fetchAdminCampaigns()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const columns = useMemo<ColumnDef<AdminCampaignItem>[]>(
    () => [
      {
        id: 'sn',
        header: 'SN',
        size: 60,
        enableColumnFilter: false,
        cell: ({ row }) => row.index + 1,
      },
      { accessorKey: 'title', header: 'Title' },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ getValue }) => (getValue() as string) || '—',
      },
      {
        accessorKey: 'campaign_type',
        header: 'Type',
        cell: ({ getValue }) => (getValue() as string) || '—',
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ getValue }) => (getValue() as string) || '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColor(status)}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ getValue }) =>
          new Date(getValue() as string).toLocaleDateString(),
      },
    ],
    [],
  );

  const openDetail = (campaign: AdminCampaignItem) => {
    setSelected(campaign);
    setLoadingRelated(true);
    if (campaign.campaign_type === 'business') {
      fetchCampaignInquiries(campaign.id)
        .then(setInquiries)
        .finally(() => setLoadingRelated(false));
    } else {
      fetchCampaignSupports(campaign.id)
        .then(setSupports)
        .finally(() => setLoadingRelated(false));
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setInquiries([]);
    setSupports([]);
  };

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search all columns..."
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500">No campaigns found.</p>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-gray-600 text-xs uppercase"
                      >
                        <div
                          className="flex items-center gap-1 cursor-pointer select-none"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <ArrowUpDown className="size-3 text-gray-400" />
                        </div>
                        {header.column.getCanFilter() && (
                          <ColumnFilter column={header.column} />
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openDetail(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-gray-700">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Showing {table.getRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm text-gray-700">
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Campaign Detail Modal */}
      {selected &&
        (() => {
          const imgUrl = resolveImageUrl(selected.image_url);
          let goals: string[] = [];
          try {
            goals = selected.goals ? JSON.parse(selected.goals) : [];
          } catch {
            goals = selected.goals ? [selected.goals] : [];
          }

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={closeDetail}
            >
              <div className="relative w-full max-w-3xl">
                {/* Close button - outside modal, top-right corner */}
                <button
                  onClick={closeDetail}
                  className="absolute -top-3 -right-3 z-10 p-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 shadow-lg border border-gray-200"
                >
                  <X className="size-5" />
                </button>

                <div
                  className="bg-white rounded-2xl shadow-xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header image */}
                  {imgUrl && (
                    <div className="relative h-56 w-full overflow-hidden rounded-t-2xl bg-gray-100">
                      <img
                        src={imgUrl}
                        alt={selected.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="px-6 py-5">
                    {/* Title + status */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        {selected.title}
                      </h2>
                      <span
                        className={`shrink-0 inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor(selected.status)}`}
                      >
                        {selected.status}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-5">
                      {selected.category && (
                        <span className="flex items-center gap-1">
                          <Tag className="size-3.5" /> {selected.category}
                        </span>
                      )}
                      {selected.campaign_type && (
                        <span className="flex items-center gap-1">
                          <Megaphone className="size-3.5" />{' '}
                          {selected.campaign_type}
                        </span>
                      )}
                      {selected.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" /> {selected.location}
                        </span>
                      )}
                      {selected.contact_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="size-3.5" /> {selected.contact_email}
                        </span>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="flex flex-wrap gap-6 text-sm text-gray-500 mb-5">
                      {selected.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          Start:{' '}
                          {new Date(selected.start_date).toLocaleDateString()}
                        </span>
                      )}
                      {selected.end_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          End:{' '}
                          {new Date(selected.end_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mb-5">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                        Description
                      </h3>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {selected.description}
                      </p>
                    </div>

                    {/* Goals */}
                    {goals.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                          Goals
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
                          {goals.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Related data section — Inquiries for business, Supports for cause */}
                    <div className="border-t border-gray-200 pt-5">
                      {selected.campaign_type === 'business' ? (
                        <>
                          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                            Inquiries ({inquiries.length})
                          </h3>
                          {loadingRelated ? (
                            <p className="text-sm text-gray-400">
                              Loading inquiries...
                            </p>
                          ) : inquiries.length === 0 ? (
                            <p className="text-sm text-gray-400">
                              No inquiries for this campaign.
                            </p>
                          ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              {inquiries.map((inq) => (
                                <div
                                  key={inq.id}
                                  className="p-3 rounded-lg bg-gray-50 border border-gray-100"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-900">
                                      {inq.name}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(
                                        inq.created_at,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    {inq.email}
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    {inq.message}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                            Supports ({supports.length})
                          </h3>
                          {loadingRelated ? (
                            <p className="text-sm text-gray-400">
                              Loading supports...
                            </p>
                          ) : supports.length === 0 ? (
                            <p className="text-sm text-gray-400">
                              No supports for this campaign.
                            </p>
                          ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              {supports.map((sup) => (
                                <div
                                  key={sup.id}
                                  className="p-3 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between"
                                >
                                  <div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {sup.user_name || 'Anonymous'}
                                    </span>
                                    <p className="text-xs text-gray-500">
                                      {sup.user_email || '—'}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-semibold text-green-700">
                                      ${sup.amount}
                                    </span>
                                    <p className="text-xs text-gray-400">
                                      {new Date(
                                        sup.created_at,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Footer with status actions */}
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selected.status !== 'active' && (
                        <button
                          onClick={async () => {
                            if (
                              await updateCampaignStatus(selected.id, 'active')
                            ) {
                              const updated = { ...selected, status: 'active' };
                              setSelected(updated);
                              setData((prev) =>
                                prev.map((c) =>
                                  c.id === selected.id ? updated : c,
                                ),
                              );
                            }
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          Activate
                        </button>
                      )}
                      {selected.status !== 'pending' && (
                        <button
                          onClick={async () => {
                            if (
                              await updateCampaignStatus(selected.id, 'pending')
                            ) {
                              const updated = {
                                ...selected,
                                status: 'pending',
                              };
                              setSelected(updated);
                              setData((prev) =>
                                prev.map((c) =>
                                  c.id === selected.id ? updated : c,
                                ),
                              );
                            }
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
                        >
                          Set Pending
                        </button>
                      )}
                      {selected.status !== 'rejected' && (
                        <button
                          onClick={async () => {
                            if (
                              await updateCampaignStatus(
                                selected.id,
                                'rejected',
                              )
                            ) {
                              const updated = {
                                ...selected,
                                status: 'rejected',
                              };
                              setSelected(updated);
                              setData((prev) =>
                                prev.map((c) =>
                                  c.id === selected.id ? updated : c,
                                ),
                              );
                            }
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                    <button
                      onClick={closeDetail}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
