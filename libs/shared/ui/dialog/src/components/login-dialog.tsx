'use client'

import { Dialog, DialogFooter, DialogHeader, DialogTitle, DpDialogContent } from '@js-monorepo/components/dialog'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import React, { forwardRef, useState } from 'react'
import './login-dialog.css'

export type SocialConfig = {
  type: 'google' | 'github' | 'facebook'
  onLogin: () => void | Promise<void>
}

export type DpLoginDialogProps = {
  readonly open: boolean
  readonly onClose: () => void
  readonly socialConfig: SocialConfig[]
}

const DpLoginDialogComponent = forwardRef<HTMLDivElement, DpLoginDialogProps>(
  ({ open, onClose, socialConfig }, ref) => {
    const [hasOpen, sethasOpen] = useState(open)

    return (
      <Dialog
        open={hasOpen}
        modal={true}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            onClose?.()
            sethasOpen(false)
          }
        }}
      >
        <DpDialogContent>
          <DialogHeader className="justify-center mb-2">
            <DialogTitle className="text-center text-xl font-semibold tracking-tight">Sign in with</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 p-2">
            {socialConfig?.map((social) => (
              <React.Fragment key={social.type}>
                {/* GOOGLE */}
                {social.type === 'google' && (
                  <button
                    type="button"
                    className="flex justify-center bg-zinc-200 w-full rounded-lg px-5 py-3 text-center text-black items-center
                     mr-2 shadow-effect transition-transform duration-300 hover:scale-105 font-medium text-sm"
                    onClick={() => {
                      social.onLogin()
                      sethasOpen(false)
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 shrink-0"
                      >
                        <g fill="none" fillRule="evenodd">
                          <path
                            d="M3.048 16.267A10.242 10.242 0 012 11.733c0-1.631.376-3.17 1.048-4.534L6.489 9.83a6.072 6.072 0 00-.303 1.903c0 .665.106 1.304.303 1.902l-3.441 2.632z"
                            fill="#FBBC05"
                          ></path>
                          <path
                            d="M3.048 7.199A10.203 10.203 0 0112.233 1.5c2.604 0 4.93.977 6.744 2.558L16 7.035a5.916 5.916 0 00-3.767-1.349A6.035 6.035 0 006.489 9.83L3.048 7.2z"
                            fill="#EA4335"
                          ></path>
                          <path
                            d="M3.046 16.264l3.44-2.638a6.035 6.035 0 005.747 4.153c2.837 0 4.976-1.442 5.488-3.953h-5.488V9.872h9.534c.14.605.233 1.256.233 1.86 0 6.512-4.651 10.233-9.767 10.233a10.203 10.203 0 01-9.187-5.701z"
                            fill="#34A853"
                          ></path>
                          <path
                            d="M18.902 19.417l-3.267-2.53c1.068-.674 1.811-1.714 2.086-3.061h-5.488V9.872h9.534c.14.605.233 1.256.233 1.86 0 3.336-1.22 5.939-3.098 7.685z"
                            fill="#4285F4"
                          ></path>
                        </g>
                      </svg>
                      <span className="font-medium tracking-wide">
                        <span className="hidden sm:inline">Sign in with </span>Google
                      </span>
                    </div>
                  </button>
                )}

                {/* GITHUB */}
                {social.type === 'github' && (
                  <button
                    type="button"
                    className="flex justify-center bg-[#24292F] shadow-effect w-full text-white rounded-lg px-5 py-3 text-center 
                    items-center mr-2 transition-transform duration-300 hover:scale-105 font-medium text-sm"
                    onClick={() => {
                      social.onLogin()
                      sethasOpen(false)
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg
                        className="w-5 h-5 shrink-0"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fab"
                        data-icon="github"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 496 512"
                      >
                        <path
                          fill="currentColor"
                          d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
                        ></path>
                      </svg>
                      <span className="font-medium tracking-wide">
                        <span className="hidden sm:inline">Sign in with </span>Github
                      </span>
                    </div>
                  </button>
                )}

                {/* FACEBOOK */}
                {social.type === 'facebook' && (
                  <button
                    type="button"
                    className="flex justify-center bg-[#3b5998] w-full shadow-effect text-white rounded-lg px-5 py-3 text-center 
                    items-center mr-2 transition-transform duration-300 hover:scale-105 font-medium text-sm"
                    onClick={() => {
                      social.onLogin()
                      sethasOpen(false)
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <svg
                        className="w-5 h-5 shrink-0"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fab"
                        data-icon="facebook-f"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 320 512"
                      >
                        <path
                          fill="currentColor"
                          d="M279.1 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.4 0 225.4 0c-73.22 0-121.1 44.38-121.1 124.7v70.62H22.89V288h81.39v224h100.2V288z"
                        ></path>
                      </svg>
                      <span className="font-medium tracking-wide">
                        <span className="hidden sm:inline">Sign in with </span>Facebook
                      </span>
                    </div>
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
          <DialogFooter>
            <div className="mt-4 text-gray-600 text-center">
              <p className="text-xs leading-relaxed">
                By proceeding, you agree to our{' '}
                <DpNextNavLink
                  href="/terms-of-use"
                  className="underline font-medium hover:text-gray-800 transition-colors"
                >
                  Terms of Use
                </DpNextNavLink>{' '}
                and confirm that you have read our{' '}
                <DpNextNavLink
                  href="/privacy-cookie-statement"
                  className="underline font-medium hover:text-gray-800 transition-colors"
                >
                  Privacy and Cookie Statement
                </DpNextNavLink>
                .
              </p>
            </div>
          </DialogFooter>
        </DpDialogContent>
      </Dialog>
    )
  }
)
DpLoginDialogComponent.displayName = 'DpLoginDialogComponent'

export { DpLoginDialogComponent }
