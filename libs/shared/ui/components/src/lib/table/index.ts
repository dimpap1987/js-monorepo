import { useState } from 'react'

export * from './data-table'
export * from './data-table-column-header'
export * from './data-table-pagination'
export * from './table'

export function usePagination({
  pageSizeProps = 10,
  pageIndexProps = 0,
}: {
  pageSizeProps?: number
  pageIndexProps?: number
}) {
  const [pagination, setPagination] = useState({
    pageSize: pageSizeProps,
    pageIndex: pageIndexProps,
  })
  const { pageSize, pageIndex } = pagination

  return {
    limit: pageSize,
    onPaginationChange: setPagination,
    pagination,
    skip: pageSize * pageIndex,
  }
}
