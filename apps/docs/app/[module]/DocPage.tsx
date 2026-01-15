'use client'

import dynamic from 'next/dynamic'

const DynamicDpMarkdown = dynamic(() => import('@js-monorepo/markdown').then((module) => module.DpMarkdown), {
  ssr: false,
})

function DocPage({ path, data }: { path: string; data: string }) {
  return (
    <div className="prose prose-invert prose-headings:scroll-mt-24 prose-headings:font-semibold prose-a:text-emerald-400 hover:prose-a:text-emerald-300 prose-code:rounded prose-code:bg-slate-900 prose-code:px-1 prose-code:py-0.5 prose-pre:border prose-pre:border-slate-800 prose-pre:bg-slate-950/80 max-w-none">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-950 px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Library path</span>
        </span>
        <span className="font-mono text-[11px] text-slate-300">{path}</span>
      </div>
      <DynamicDpMarkdown markdownCode={data} />
    </div>
  )
}

export default DocPage
