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
import { fetchAdminInquiries } from '../services/adminApi';
import type { AdminInquiryItem } from '../services/adminApi';
import { ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

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

export function AdminInquiries() {
  const [data, setData] = useState<AdminInquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selected, setSelected] = useState<AdminInquiryItem | null>(null);

  useEffect(() => {
    fetchAdminInquiries()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const columns = useMemo<ColumnDef<AdminInquiryItem>[]>(
    () => [
      {
        id: 'sn',
        header: 'SN',
        size: 60,
        enableColumnFilter: false,
        cell: ({ row }) => row.index + 1,
      },
      { accessorKey: 'campaign_title', header: 'Campaign' },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'message',
        header: 'Message',
        cell: ({ getValue }) => (
          <span className="max-w-[250px] truncate block">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Date',
        cell: ({ getValue }) =>
          new Date(getValue() as string).toLocaleDateString(),
      },
    ],
    [],
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
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
        <p className="text-gray-500">No inquiries found.</p>
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
                    onClick={() => setSelected(row.original)}
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

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Inquiry Detail
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Campaign</p>
                <p className="text-sm font-medium text-gray-900">
                  {selected.campaign_title}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Name</p>
                  <p className="text-sm text-gray-900">{selected.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Email</p>
                  <p className="text-sm text-gray-900">{selected.email}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Message</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Date</p>
                <p className="text-sm text-gray-900">
                  {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
