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
        <PageProgressBar color="red">
          <section className="p-5 max-w-full">
            <div className="fixed w-[200px]">
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
            {children}
          </section>
        </PageProgressBar>
      </body>
    </html>
  )
}
