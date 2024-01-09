import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
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
      <div className="ml-[220px] md:ml-[300px] prose prose-lg">
        <div className="flex gap-2 flex-wrap text-slate-500">
          <span>This module is located at:</span>
          <strong className="italic"> {doc.path}</strong>
        </div>
        <div className="max-w-[640px]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {doc.data}
          </ReactMarkdown>
        </div>
      </div>
    )
  )
}

export default DocPage
