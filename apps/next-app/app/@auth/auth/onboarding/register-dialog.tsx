'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { authClient, useSession } from '@js-monorepo/auth-client'
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
import { RegisterUserSchema } from '@js-monorepo/schemas'
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
import {
  handleValidation,
  handleValidationErrros,
  initialRegisterValidations,
} from './utils'
import Image from 'next/image'
import { useNotifications } from '@js-monorepo/notification'

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

export function RegisterDialog({
  formInput,
  userProfileImage,
}: RegisterDialogType) {
  //hooks
  const [isOpen, setIsOpen] = useState(true)
  const [validations, setValidations] = useState(initialRegisterValidations)
  const pathname = usePathname()
  const { replace, push } = useRouter()
  const { user, refreshSession } = useSession()
  const [addNotification] = useNotifications()
  const form = useForm({
    resolver: zodResolver(RegisterUserSchema),
    mode: 'all',
    defaultValues: {
      email: formInput?.email,
      username: '',
    },
  })

  useEffect(() => {
    form.watch(() => {
      setTimeout(() => handleValidation(form, setValidations))
    })
  }, [form])

  useEffect(() => {
    if (user?.username) {
      addNotification({
        message: `Welcome aboard, ${user.username} ! 🚀`,
        duration: 5000,
      })
    }
  }, [user?.username])

  if (pathname !== '/auth/onboarding') return null

  const onSubmit = async (formData: any, e?: React.BaseSyntheticEvent) => {
    e?.preventDefault()
    form.clearErrors()
    const response = await authClient.registerUser({
      username: formData.username,
    })
    if (response.ok) {
      refreshSession()
      replace('/')
    } else {
      if (response.errors) {
        handleValidationErrros(response.errors, setValidations)
      }
    }
  }

  return (
    <DpDialog
      className="top-[10%] sm:w-[386px]"
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false)
        push('/')
      }}
      autoClose={false}
    >
      <DpDialogHeader className="font-bold justify-center ml-9">
        Sign Up
      </DpDialogHeader>
      <DpDialogContent>
        {userProfileImage && (
          <div className="p-2 flex justify-center">
            <Image
              className="rounded-2xl"
              width={80}
              height={80}
              alt="user profile"
              src={userProfileImage}
            ></Image>
          </div>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              onSubmit,
              (errors, e?: React.BaseSyntheticEvent) => {
                e?.preventDefault()
                handleValidationErrros(errors, setValidations)
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
                disabled={!form.formState.isValid}
                loading={form.formState.isSubmitting}
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
