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
import { fetchAdminSupports } from '../services/adminApi';
import type { AdminSupportItem } from '../services/adminApi';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

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

export function AdminSupports() {
  const [data, setData] = useState<AdminSupportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    fetchAdminSupports()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const columns = useMemo<ColumnDef<AdminSupportItem>[]>(
    () => [
      {
        id: 'sn',
        header: 'SN',
        size: 60,
        enableColumnFilter: false,
        cell: ({ row }) => row.index + 1,
      },
      { accessorKey: 'campaign_title', header: 'Campaign' },
      {
        accessorKey: 'user_name',
        header: 'Name',
        cell: ({ getValue }) => (getValue() as string) || '—',
      },
      {
        accessorKey: 'user_email',
        header: 'Email',
        cell: ({ getValue }) => (getValue() as string) || '—',
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ getValue }) => `$${getValue()}`,
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
        <h1 className="text-2xl font-bold text-gray-900">Supports</h1>
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
        <p className="text-gray-500">No supports found.</p>
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
                  <tr key={row.id} className="hover:bg-gray-50">
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
    </div>
  );
}
