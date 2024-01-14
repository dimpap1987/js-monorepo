import { MarkdownComponent } from '@js-monorepo/markdown'
import jsonData from '../../public/README.json'

interface DocPageProps {
  readonly params: {
    module: string
  }
}

function DocPage({ params: { module } }: DocPageProps) {
  const doc = jsonData.find((json) => json.module === module)

  return (
    doc && (
      <div className="prose prose-lg mx-auto max-w-[82ch]">
        <div className="flex gap-2 flex-wrap text-slate-500">
          <span>This module is located at:</span>
          <strong className="italic"> {doc.path}</strong>
        </div>
        <div>
          <MarkdownComponent markdownCode={doc.data}></MarkdownComponent>
        </div>
      </div>
    )
  )
}

export default DocPage
