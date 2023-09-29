import { Loader } from '@js-monorepo/loader'

export default async function Index() {
  return (
    <main>
      <h1> Hello everyone...</h1>
      <Loader message="Waiting for transcation" show={false}></Loader>
    </main>
  )
}
