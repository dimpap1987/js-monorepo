import { RedirectType } from 'next/dist/client/components/redirect'
import { redirect } from 'next/navigation'
import jsonData from '../public/README.json'

export default function LandingPage() {
  if (jsonData?.length) {
    redirect(`docs/${jsonData[0]?.module}`, RedirectType.replace)
  }

  return <h1>Docs</h1>
}
