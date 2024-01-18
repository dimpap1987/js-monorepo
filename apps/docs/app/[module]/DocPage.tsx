'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const DynamicDpMarkdown = dynamic(
  () => import('@js-monorepo/markdown').then((module) => module.DpMarkdown),
  {
    ssr: false,
  }
)

function DocPage({ path, data }: { path: string; data: string }) {
  return (
    <div className="prose prose-lg mx-auto max-w-[82ch]">
      <div className="flex gap-2 flex-wrap text-slate-500">
        <span>This module is located at:</span>
        <strong className="italic">{path}</strong>
      </div>
      <div>
        <DynamicDpMarkdown markdownCode={data}></DynamicDpMarkdown>
      </div>
    </div>
  )
}

export default DocPage
