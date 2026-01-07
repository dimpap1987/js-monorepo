import { DpButton } from '@js-monorepo/button'
import { cn } from '@js-monorepo/ui/util'
import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  className?: string
}

// Server Page starts from '1' for react's table form '0'

export function DataTablePagination<TData>({ table, className }: DataTablePaginationProps<TData>) {
  const currentPageIndex = table.getState().pagination.pageIndex
  const pageCount = table.getPageCount() || 1

  return (
    <div className={cn('flex items-center justify-between p-3', className)}>
      <div className="flex items-center gap-1 justify-between overflow-auto w-full">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium hidden sm:block">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              const newPageSize = Number(value)
              const pageIndex = table.getState().pagination.pageIndex

              const adjustedPageIndex =
                pageIndex >= Math.ceil(table.getRowModel().rows.length / newPageSize) ? 0 : pageIndex

              table.setPageSize(newPageSize)
              table.setPageIndex(adjustedPageIndex)
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="bg-background">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPageIndex + 1} of {pageCount}{' '}
        </div>
        <div className="flex items-center space-x-2">
          <DpButton
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={currentPageIndex === 0}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </DpButton>
          <DpButton
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.setPageIndex(currentPageIndex - 1)}
            disabled={currentPageIndex === 0}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </DpButton>
          <DpButton
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={currentPageIndex === pageCount - 1}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </DpButton>
          <DpButton
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={currentPageIndex === pageCount - 1}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </DpButton>
        </div>
      </div>
    </div>
  )
}
