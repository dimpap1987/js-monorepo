'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { DpButton } from '@js-monorepo/button'
import { DpDialog, DpDialogContent, DpDialogHeader } from '@js-monorepo/dialog'
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@js-monorepo/form'
import { useNotifications } from '@js-monorepo/notification'
import {
  RegisterUserSchema,
  RegisterUserSchemaType,
} from '@js-monorepo/schemas'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { FaLock } from 'react-icons/fa'
import registerUser from '../../../../actions/register'

export type RegisterDialogProps = {
  readonly redirectAfterRegister: string
  readonly uuid: string
  readonly email: string
}

function RegisterDialog({
  uuid,
  email,
  redirectAfterRegister,
}: RegisterDialogProps) {
  const pathname = usePathname()
  const router = useRouter()
  const usernameInputRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isPending, startTransition] = useTransition()
  const [isOpen, setOpen] = useState(true)
  const [addNotification] = useNotifications()

  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus()
    }
  }, [])

  const form = useForm<RegisterUserSchemaType>({
    resolver: zodResolver(RegisterUserSchema),
    defaultValues: {
      email: email,
      username: '',
      uuid: uuid,
    },
  })

  if (pathname !== '/auth/register') return null

  const onSubmit = (values: RegisterUserSchemaType) => {
    setError(undefined)
    startTransition(() => {
      registerUser(values).then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setOpen(false)
          addNotification({
            message: data.message ?? 'Successfully Registered!',
            description: "Welcome 'user123'",
            duration: 5000,
          })
          router.replace(redirectAfterRegister)
        }
      })
    })
  }

  const isButtonDisabled = (): boolean => {
    return form.formState?.isSubmitted && !form.formState?.isValid
  }

  return (
    <DpDialog
      isOpen={isOpen}
      onClose={() => router.replace(redirectAfterRegister)}
      className="text-black top-1/4 shadow-2xl shadow-cyan-500/50 w-full min-w-[330px] sm:w-[60%] md:w-[40%] lg:w-[30%] p-2"
    >
      <DpDialogHeader className="justify-center p-3">
        Create your account
      </DpDialogHeader>
      <DpDialogContent className="p-3">
        <section className="flex flex-col items-center justify-center mx-auto ">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full p-3">
              {/* email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="bg-destructive/15 relative pointer-events-none">
                        <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          {...field}
                          disabled={isPending}
                          value={email}
                          readOnly={true}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        ref={usernameInputRef}
                        disabled={isPending}
                        placeholder="Enter your username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* uuid (hidden) */}
              <FormField
                control={form.control}
                name="uuid"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} hidden={true} value={uuid} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="my-2">
                <FormError message={error} />
              </div>

              {/* Submit */}

              <DpButton
                variant="accent"
                size="large"
                className="w-full text-white"
                type="submit"
                disabled={isButtonDisabled()}
                loading={isPending}
              >
                Register
              </DpButton>
            </form>
          </Form>
        </section>
      </DpDialogContent>
    </DpDialog>
  )
}

export default RegisterDialog
