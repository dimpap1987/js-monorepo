import { PropsWithChildren } from 'react'

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <section className="container flex flex-grow [&>*]:flex-grow">
      {children}
    </section>
  )
}
