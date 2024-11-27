import { constructURIQueryString } from '@js-monorepo/ui/util'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

interface Pagination {
  pageIndex: number
  pageSize: number
}

interface UsePaginationWithParamsResult {
  pagination: Pagination
  setPagination: Dispatch<SetStateAction<Pagination>>
  searchQuery: string
}

function updateUrlParams(
  pagination: Pagination,
  replace: (url: string) => void,
  searchParams: URLSearchParams
) {
  const newParams = new URLSearchParams(searchParams)
  newParams.set('page', pagination.pageIndex.toString())
  newParams.set('pageSize', pagination.pageSize.toString())
  replace('?' + newParams.toString())
}

// Pagination hook with URL parameter synchronization
export function usePaginationWithParams(
  pageInit = 1,
  pageSizeInit = 10
): UsePaginationWithParamsResult {
  const searchParams = useSearchParams()
  const { replace } = useRouter()

  const initialPage = searchParams.get('page')
    ? Number(searchParams.get('page'))
    : pageInit
  const initialPageSize = searchParams.get('pageSize')
    ? Number(searchParams.get('pageSize'))
    : pageSizeInit

  const [paginationInner, setPaginationInner] = useState<Pagination>({
    pageIndex: initialPage,
    pageSize: initialPageSize,
  })

  useEffect(() => {
    updateUrlParams(paginationInner, replace, searchParams)
  }, [paginationInner])

  const setPagination = useCallback<Dispatch<SetStateAction<Pagination>>>(
    (newPaginationOrUpdater) => {
      setPaginationInner((prevPagination) => {
        // Determine the new pagination state
        const newPagination =
          typeof newPaginationOrUpdater === 'function'
            ? newPaginationOrUpdater(prevPagination)
            : newPaginationOrUpdater

        return newPagination
      })
    },
    [replace, searchParams]
  )

  const searchQuery = useMemo(
    () => constructURIQueryString(paginationInner),
    [paginationInner]
  )

  return {
    pagination: paginationInner,
    setPagination,
    searchQuery,
  }
}
