import { DpNextNavLink } from '@js-monorepo/nav-link'
import './global.css'
import { DpNextPageProgressBar } from '@js-monorepo/page-progress-bar'
import { getDocs } from '../lib/docs'

export const metadata = {
  title: 'Welcome to docs',
}

export default async function RootLayout({ children }: { readonly children?: React.ReactNode }) {
  const docs = await getDocs()

  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        <DpNextPageProgressBar color="#22c55e">
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/30">
                    JS
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">JS Monorepo</div>
                    <div className="text-xs text-slate-400">Internal library documentation</div>
                  </div>
                </div>
                <div className="hidden items-center gap-3 text-xs text-slate-400 sm:flex">
                  <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">
                    Libraries: <span className="font-semibold text-slate-100">{docs.length}</span>
                  </span>
                </div>
              </div>
            </header>

            <main className="mx-auto flex max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
              <aside className="sticky top-[4.5rem] hidden h-[calc(100vh-5rem)] w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/60 p-3 pr-4 text-sm backdrop-blur-lg sm:block">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Libraries</span>
                </div>
                <div className="space-y-1 overflow-y-auto pr-1 text-xs text-slate-300">
                  {docs.map((doc) => (
                    <DpNextNavLink
                      key={doc.module}
                      href={`/${doc.module}`}
                      className="block rounded-md px-2 py-1.5 text-left transition-colors duration-200 hover:bg-slate-800 hover:text-slate-50 focus:bg-slate-800 focus:text-slate-50"
                      activeClassName="bg-slate-800 text-slate-50"
                    >
                      {doc.module}
                    </DpNextNavLink>
                  ))}
                </div>
              </aside>

              <section className="flex-1">
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-xl shadow-black/40 sm:p-7">
                  {children}
                </div>
              </section>
            </main>
          </div>
        </DpNextPageProgressBar>
      </body>
    </html>
  )
}
