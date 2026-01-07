import { DpNextNavLink } from '@js-monorepo/nav-link'
import './global.css'
import jsonData from '../public/README.json'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'

export const metadata = {
  title: 'Welcome to docs',
}

export default function RootLayout({ children }: { readonly children?: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <DpNextPageProgressBar color="red">
          <section className="flex">
            <div className="min-w-[200px] sticky top-0 h-screen bg-gray-200 p-4">
              {jsonData.map((json) => (
                <DpNextNavLink
                  className="block p-2 w-full text-left transition-colors duration-300 hover:bg-slate-300 focus:bg-slate-300"
                  key={json.module}
                  href={`docs/${json.module}`}
                >
                  {json.module}
                </DpNextNavLink>
              ))}
            </div>
            <div className="flex-1 p-4">{children}</div>
          </section>
        </DpNextPageProgressBar>
      </body>
    </html>
  )
}
