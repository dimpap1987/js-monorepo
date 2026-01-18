'use client'

import { Dialog, DialogFooter, DialogHeader, DialogTitle, DpDialogContent } from '@js-monorepo/components/ui/dialog'
import { SocialLoginButton, type SocialProvider } from '@js-monorepo/components/ui/social-login-button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { forwardRef, useState } from 'react'

export type SocialConfig = {
  type: SocialProvider
  onLogin: () => void | Promise<void>
  loading?: boolean
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
              <SocialLoginButton
                key={social.type}
                provider={social.type}
                loading={social.loading}
                onClick={() => {
                  social.onLogin()
                  sethasOpen(false)
                }}
              />
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
