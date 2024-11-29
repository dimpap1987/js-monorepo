import { DpButton } from '@js-monorepo/button'
import { Pageable, PaginationType } from '@js-monorepo/types'
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
        <DpButton
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
        </DpButton>

        <DpButton
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
        </DpButton>
      </div>

      <span className="text-xs sm:text-md font-semibold self-center">
        {pagination.page || 1} of {totalPages || 1}
      </span>

      <div className="flex gap-2">
        <DpButton
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
        </DpButton>
        <DpButton
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
        </DpButton>
      </div>
    </div>
  )
}
