import { DpLoadingSpinner } from '@js-monorepo/loader'
import dynamic from 'next/dynamic'
import React from 'react'

const DynamicMap = dynamic(() => import('./map-leaflet'), {
  loading: () => (
    <div className="text-white min-h-full flex justify-center items-center">
      <DpLoadingSpinner message="Loading Map..."></DpLoadingSpinner>
    </div>
  ),
  ssr: false,
})

const MemoizedDynamicMap = React.memo(DynamicMap)

export default MemoizedDynamicMap
