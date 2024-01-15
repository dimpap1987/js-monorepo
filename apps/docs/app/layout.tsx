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
      <body className="min-h-100svh bg-slate-50">
        <PageProgressBar color="red">
          <section className="flex">
            <div className="min-w-[200px] sticky top-0 h-screen bg-gray-200 p-4">
              {jsonData.map((json) => (
                <NavLink
                  className="block p-2 w-full text-left transition-colors duration-300 hover:bg-slate-300 focus:bg-slate-300"
                  key={json.module}
                  href={`docs/${json.module}`}
                >
                  {json.module}
                </NavLink>
              ))}
            </div>
            <div className="flex-1 p-4">{children}</div>
          </section>
        </PageProgressBar>
      </body>
    </html>
  )
}
