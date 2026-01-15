import { RedirectType } from 'next/dist/client/components/redirect'
import { redirect } from 'next/navigation'
import { getDocs } from '../lib/docs'

export default async function LandingPage() {
  const docs = await getDocs()

  if (docs.length) {
    redirect(`/${docs[0]?.module}`, RedirectType.replace)
  }

  return <h1>Docs</h1>
}
