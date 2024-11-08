import { PropsWithChildren } from 'react'

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <section className="flex flex-grow container [&>*]:flex-grow">
      {children}
    </section>
  )
}
