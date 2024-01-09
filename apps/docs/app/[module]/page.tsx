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
      <>
        <div className="flex gap-2 justify-end">
          <span>This module is located at:</span>
          <strong className="italic"> {doc.path}</strong>
        </div>

        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {doc.data}
        </ReactMarkdown>
      </>
    )
  )
}

export default DocPage
