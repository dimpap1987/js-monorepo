import { PropsWithChildren } from 'react'

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <section className="flex flex-grow [&>*]:flex-grow">{children}</section>
  )
}
