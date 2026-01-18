import { Button } from '@js-monorepo/components/ui/button'
import { Pageable } from '@js-monorepo/types/pagination'
import { Dispatch, SetStateAction } from 'react'
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
  MdOutlineNavigateBefore,
  MdOutlineNavigateNext,
} from 'react-icons/md'

export function PaginationComponent({
  pagination,
  totalPages,
  onChange,
}: {
  pagination: Pageable
  totalPages: number
  onChange: Dispatch<SetStateAction<Pageable>>
}) {
  return (
    <div className="flex justify-around p-2 pb-0 gap-2 border-t border-border">
      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={() =>
            onChange((prev) => ({
              pageSize: prev.pageSize,
              page: 1,
            }))
          }
          disabled={pagination.page === 1}
          className={`px-2 py-1 rounded ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <MdOutlineKeyboardDoubleArrowLeft />
        </Button>

        <Button
          variant="primary"
          onClick={() =>
            onChange((prev) => ({
              pageSize: prev.pageSize,
              page: Math.max(prev.page - 1, 0),
            }))
          }
          disabled={pagination.page === 1}
          className={`px-2 py-1 rounded ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <MdOutlineNavigateBefore />
        </Button>
      </div>

      <span className="text-xs sm:text-md font-semibold self-center">
        {pagination.page || 1} of {totalPages || 1}
      </span>

      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={() =>
            onChange((prev) => ({
              pageSize: prev.pageSize,
              page: Math.min(prev.page + 1, totalPages || 1),
            }))
          }
          disabled={pagination.page === totalPages}
          className={`px-2 py-1 rounded ${pagination.page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <MdOutlineNavigateNext />
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            onChange((prev) => ({
              pageSize: prev.pageSize,
              page: totalPages || 1,
            }))
          }
          disabled={pagination.page === totalPages}
          className={`px-2 py-1 rounded ${pagination.page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <MdOutlineKeyboardDoubleArrowRight />
        </Button>
      </div>
    </div>
  )
}
