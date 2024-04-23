'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { registerUser, useSession } from '@js-monorepo/auth-client'
import { DpButton } from '@js-monorepo/button'
import { DpDialog, DpDialogContent, DpDialogHeader } from '@js-monorepo/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '@js-monorepo/form'
import {
  RegisterUserSchema,
  registerUserSchemaConfig,
} from '@js-monorepo/schemas'
import { useRouter } from 'next-nprogress-bar'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { BsCheck2Circle } from 'react-icons/bs'
import { FaRegTimesCircle } from 'react-icons/fa'
import { HiLockClosed } from 'react-icons/hi'
import { ImUser } from 'react-icons/im'
import { IoMdInformationCircle } from 'react-icons/io'
import { RegisterDialogErrorComponentType, RegisterDialogType } from './types'
import { handleValidation } from './utils'

const initialRegisterValidations: RegisterDialogErrorComponentType[] = [
  {
    status: 'untouched',
    type: 'too_small',
    message: registerUserSchemaConfig.MIN_ERROR_MESSAGE,
  },
  {
    status: 'untouched',
    type: 'too_big',
    message: registerUserSchemaConfig.MAX_ERROR_MESSAGE,
  },
]

const RegisterDialogErrorComponent = ({
  validations,
}: {
  validations: RegisterDialogErrorComponentType[]
}) => {
  return (
    validations && (
      <div className="p-3 rounded-md text-sm">
        {validations?.map((validation) => (
          <div key={validation.type} className="flex items-center gap-2 py-1">
            {/* Render IoMdInformationCircle when status is 'untouched' */}
            {validation.status === 'untouched' && (
              <IoMdInformationCircle className="text-xl shrink-0" />
            )}

            {/* Render BsCheck2Circle when status is 'valid' */}
            {validation.status === 'valid' && (
              <BsCheck2Circle className="text-green-600 text-xl shrink-0" />
            )}

            {/* Render FaRegTimesCircle when status is 'invalid' */}
            {validation.status === 'invalid' && (
              <FaRegTimesCircle className="text-red-600 text-xl shrink-0" />
            )}

            <p className="font-semibold">{validation.message}</p>
          </div>
        ))}
      </div>
    )
  )
}

export function RegisterDialog({ formInput }: RegisterDialogType) {
  //hooks
  const [isOpen, setIsOpen] = useState(true)
  const [validations, setValidations] = useState(initialRegisterValidations)
  const pathname = usePathname()
  const { replace } = useRouter()
  const { refreshSession } = useSession()
  const form = useForm({
    resolver: zodResolver(RegisterUserSchema),
    mode: 'all',
    defaultValues: {
      email: formInput?.email,
      username: '',
    },
  })

  useEffect(() => {
    handleValidation(form, setValidations)
  }, [form.formState.isValid])

  if (pathname !== '/auth/onboarding') return null

  const onSubmit = async (formData: any, e?: React.BaseSyntheticEvent) => {
    e?.preventDefault()
    form.clearErrors()
    const response = await registerUser({
      username: formData.username,
    })
    if (response.ok) {
      refreshSession?.()
      replace('/')
    } else {
      if (response.errors) {
        const usernameErrors = Object.values(response.errors ?? {})
        const newValidations: RegisterDialogErrorComponentType[] =
          usernameErrors.map((error: any) => ({
            status: 'invalid',
            type: error?.code ?? 'custom',
            message: error?.message ?? 'Unknown error',
          }))

        setValidations((prev) => {
          const filteredValidations = prev.filter(
            (validation) =>
              !newValidations?.some(
                (newValidation) => newValidation.type === validation.type
              )
          )
          return [...filteredValidations, ...newValidations]
        })
      }
    }
  }

  return (
    <DpDialog
      className="top-1/4 sm:w-[375px]"
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false)
      }}
      autoClose={false}
    >
      <DpDialogHeader className="font-bold justify-center ml-9">
        Sign Up
      </DpDialogHeader>
      <DpDialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              onSubmit,
              (formData: any, e?: React.BaseSyntheticEvent) => {
                e?.preventDefault()
              }
            )}
          >
            {/* email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl className="relative flex items-center">
                    <HiLockClosed className="absolute left-2 text-foreground" />
                    <Input
                      {...field}
                      readOnly
                      className="pl-7 ring ring-primary"
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
                  <FormLabel>Username</FormLabel>
                  <FormControl className="relative flex items-center">
                    <ImUser className="absolute left-2 text-foreground" />
                    <Input
                      placeholder="Type your username"
                      className="pl-7"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="mt-7">
              <DpButton
                disabled={form.formState.isSubmitted && !form.formState.isValid}
                className="w-full"
              >
                Sign Up
              </DpButton>
            </div>
          </form>
        </Form>

        <RegisterDialogErrorComponent
          validations={validations}
        ></RegisterDialogErrorComponent>
      </DpDialogContent>
    </DpDialog>
  )
}
