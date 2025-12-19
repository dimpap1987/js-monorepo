import { Pageable } from '@js-monorepo/types'
import { constructURIQueryString } from '@js-monorepo/ui/util'
import { useRouter, useSearchParams } from 'next/navigation'
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'

interface UsePaginationWithParamsResult {
  pagination: Pageable
  setPagination: Dispatch<SetStateAction<Pageable>>
  searchQuery: string
}

function updateUrlParams(pagination: Pageable, replace: (url: string) => void, searchParams: URLSearchParams) {
  const newParams = new URLSearchParams(searchParams)
  newParams.set('page', pagination?.page?.toString())
  newParams.set('pageSize', pagination?.pageSize?.toString())
  replace('?' + newParams.toString())
}

// Pagination hook with URL parameter synchronization
export function usePaginationWithParams(pageInit = 1, pageSizeInit = 10): UsePaginationWithParamsResult {
  const searchParams = useSearchParams()
  const { replace } = useRouter()

  const initialPage = searchParams.get('page') ? Number(searchParams.get('page')) : pageInit
  const initialPageSize = searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : pageSizeInit

  const [paginationInner, setPaginationInner] = useState<Pageable>({
    page: initialPage,
    pageSize: initialPageSize,
  })

  useEffect(() => {
    updateUrlParams(paginationInner, replace, searchParams)
  }, [paginationInner, replace, searchParams])

  const setPagination = useCallback<Dispatch<SetStateAction<Pageable>>>(
    (newPaginationOrUpdater) => {
      setPaginationInner((prevPagination) => {
        // Determine the new pagination state
        const newPagination =
          typeof newPaginationOrUpdater === 'function' ? newPaginationOrUpdater(prevPagination) : newPaginationOrUpdater

        return newPagination
      })
    },
    [replace, searchParams]
  )

  const searchQuery = useMemo(() => constructURIQueryString(paginationInner), [paginationInner])

  return {
    pagination: paginationInner,
    setPagination,
    searchQuery,
  }
}
