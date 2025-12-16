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
    <div className="overflow-auto rounded-t-lg rounded-b-lg border border-border bg-card">
      <Table className="table-fixed divide-y divide-border flex-1 overscroll-none">
        <TableHeader className="bg-muted/30">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={`text-xs font-bold text-foreground tracking-wider w-[${header.getSize()}px]`}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="bg-card divide-y divide-border">
          {loading ? (
            // Render skeletons if loading
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {columns.map((__, colIndex) => (
                  <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`} className="text-sm text-foreground">
                    <Skeleton className="h-4" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-sm text-foreground">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns?.length} className="h-24 text-center text-foreground-muted">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!loading && (
        <DataTablePagination table={table} className="bg-card text-sm text-foreground border-t border-border" />
      )}
    </div>
  )
}
