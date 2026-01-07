import jsonData from '../../data/README.json'
import DocPage from './DocPage'

interface PageProps {
  readonly params: {
    module: string
  }
}

function Page({ params: { module } }: PageProps) {
  const doc = jsonData.find((json) => json.module === module)

  return doc && <DocPage data={doc.data} path={doc.path}></DocPage>
}

export default Page
