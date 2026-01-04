'use react'

import { zodResolver } from '@hookform/resolvers/zod'
import { authClient, useSession } from '@js-monorepo/auth/next/client'
import { DpButton } from '@js-monorepo/button'
import { Form, FormControl, FormField, FormItem, FormLabel, Input } from '@js-monorepo/components/form'
import { useNotifications } from '@js-monorepo/notification'
import { cn } from '@js-monorepo/ui/util'
import { RegisterUserSchema } from '@js-monorepo/schemas'
import { useRouter } from 'next-nprogress-bar'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { BsCheck2Circle } from 'react-icons/bs'
import { FaRegTimesCircle } from 'react-icons/fa'
import { FaAt } from 'react-icons/fa6'
import { HiLockClosed } from 'react-icons/hi'
import { IoMdInformationCircle } from 'react-icons/io'
import { RegisterDialogErrorComponentType, RegisterDialogType } from './types'
import { handleValidation, handleValidationErrros, initialRegisterValidations } from './utils'

const RegisterDialogErrorComponent = ({ validations }: { validations: RegisterDialogErrorComponentType[] }) => {
  return (
    validations && (
      <div className="mt-4 p-4 rounded-lg bg-muted border border-border space-y-2">
        {validations?.map((validation) => (
          <div key={validation.type} className="flex items-start gap-3">
            {/* Render IoMdInformationCircle when status is 'untouched' */}
            {validation.status === 'untouched' && (
              <IoMdInformationCircle className="text-lg shrink-0 mt-0.5 text-foreground-muted" />
            )}

            {/* Render BsCheck2Circle when status is 'valid' */}
            {validation.status === 'valid' && (
              <BsCheck2Circle className="text-lg shrink-0 mt-0.5 text-status-success" />
            )}

            {/* Render FaRegTimesCircle when status is 'invalid' */}
            {validation.status === 'invalid' && (
              <FaRegTimesCircle className="text-lg shrink-0 mt-0.5 text-status-error" />
            )}

            <p
              className={cn(
                'text-sm leading-relaxed',
                validation.status === 'valid' && 'text-status-success',
                validation.status === 'invalid' && 'text-status-error',
                validation.status === 'untouched' && 'text-foreground-muted'
              )}
            >
              {validation.message}
            </p>
          </div>
        ))}
      </div>
    )
  )
}

const RegisterForm = ({ formInput }: RegisterDialogType) => {
  const [validations, setValidations] = useState(initialRegisterValidations)
  const { addNotification } = useNotifications()
  const { refreshSession } = useSession()
  const { replace } = useRouter()
  const form = useForm({
    resolver: zodResolver(RegisterUserSchema),
    mode: 'all',
    defaultValues: {
      email: formInput?.email,
      username: '',
    },
  })

  useEffect(() => {
    const formSubscription = form.watch(() => {
      setTimeout(() => handleValidation(form, setValidations))
    })

    return () => {
      formSubscription.unsubscribe()
    }
  }, [form])

  const onSubmit = async (formData: any, e?: React.BaseSyntheticEvent) => {
    e?.preventDefault()
    form.clearErrors()
    const response = await authClient.registerUser({
      username: formData.username,
    })
    if (response.ok) {
      addNotification({
        message: `Welcome, ${formData.username} 👋`,
        duration: 5000,
      })
      refreshSession()
      replace('/')
    } else {
      if (response.errors) {
        handleValidationErrros(response.errors, setValidations)
        form.setError('username', {})
      }
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors, e?: React.BaseSyntheticEvent) => {
            e?.preventDefault()
            handleValidationErrros(errors, setValidations)
          })}
        >
          <div className="space-y-4">
            {/* email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email</FormLabel>
                  <FormControl className="relative flex items-center">
                    <HiLockClosed className="absolute left-3 text-foreground-muted z-10" />
                    <Input
                      {...field}
                      readOnly
                      className="pl-10 pr-4 h-11 bg-muted text-foreground-muted cursor-not-allowed border-border"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Username</FormLabel>
                  <FormControl className="relative flex items-center">
                    <FaAt className="absolute left-3 text-foreground-muted z-10" />
                    <Input placeholder="Choose a username" className="pl-10 pr-4 h-11" autoFocus {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="mt-6">
            <DpButton
              disabled={!form.formState.isValid || form.formState.isSubmitting || form.formState.isSubmitSuccessful}
              loading={form.formState.isSubmitting}
              className="w-full"
              size="large"
            >
              Complete Sign Up
            </DpButton>
          </div>
        </form>
      </Form>

      <RegisterDialogErrorComponent validations={validations}></RegisterDialogErrorComponent>
    </>
  )
}

export { RegisterForm }
