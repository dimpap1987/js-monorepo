'use client'

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { Pageable } from '@js-monorepo/types'
import { Dispatch, SetStateAction } from 'react'
import { Skeleton } from '../skeleton'
import { DataTablePagination } from './data-table-pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  totalCount: number
  pagination: Pageable
  onPaginationChange: Dispatch<
    SetStateAction<{
      pageSize: number
      pageIndex: number
    }>
  >
  loading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  onPaginationChange,
  pagination,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data: data,
    state: {
      pagination: {
        pageIndex: pagination.page - 1, //tanstack/react-table page is zero based
        pageSize: pagination.pageSize,
      },
    },
    onPaginationChange: onPaginationChange,
    pageCount: totalCount ?? 0,
    columns,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-auto rounded-t-lg rounded-b-lg border">
      <Table className="table-fixed divide-y divide-gray-200 flex-1 overscroll-none">
        <TableHeader className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() }}
                    className="text-xs font-medium text-gray-500 tracking-wider"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {loading ? (
            // Render skeletons if loading
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {columns.map((__, colIndex) => (
                  <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`} className="text-sm text-gray-900">
                    <Skeleton className="h-4" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns?.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!loading && <DataTablePagination table={table} className="bg-white text-sm text-gray-900" />}
    </div>
  )
}
