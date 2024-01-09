import { NavLink } from '@js-monorepo/nav-link'
import './global.css'
import jsonData from '../public/README.json'
import { PageProgressBar } from '@js-monorepo/page-progress-bar'

export const metadata = {
  title: 'Welcome to docs',
}

export default function RootLayout({
  children,
}: {
  readonly children?: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-100svh bg-slate-50 min-w-[300px]">
        <PageProgressBar color="blue">
          <section className="p-5 prose max-w-full">
            <div className="grid grid-rows-3 grid-cols-5 gap-2 h-full">
              <div className="row-span-3 col-span-1">
                {jsonData.map((json) => (
                  <NavLink
                    className="block py-1 w-full text-left hover:bg-slate-200"
                    key={json.module}
                    href={`docs/${json.module}`}
                  >
                    {json.module}
                  </NavLink>
                ))}
              </div>
              <div className="row-span-3 col-span-4">{children}</div>
            </div>
          </section>
        </PageProgressBar>
      </body>
    </html>
  )
}
