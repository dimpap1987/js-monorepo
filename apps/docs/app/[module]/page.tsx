import { notFound } from 'next/navigation'
import { getDocByModule } from '../../lib/docs'
import DocPage from './DocPage'

interface PageProps {
  readonly params: {
    module: string
  }
}

async function Page({ params: { module } }: PageProps) {
  const doc = await getDocByModule(module)

  if (!doc) {
    notFound()
  }

  return <DocPage data={doc.data} path={doc.path}></DocPage>
}

export default Page
