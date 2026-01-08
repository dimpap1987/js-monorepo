export type Pageable = {
  page: number
  pageSize: number
}

export type PaginationType<T = any> = {
  page: number
  content: T[]
  pageSize: number
  totalCount: number
  totalPages: number
}

export type CursorPagination = {
  cursor: number | null
  limit: number
}

export type CursorPaginationType<T = any> = {
  content: T[]
  nextCursor: number | null
  hasMore: boolean
  limit: number
}
