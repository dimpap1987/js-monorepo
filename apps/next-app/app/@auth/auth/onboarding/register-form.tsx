'use react'

import { zodResolver } from '@hookform/resolvers/zod'
import { authClient, useSession } from '@js-monorepo/auth/next/client'
import { DpButton } from '@js-monorepo/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '@js-monorepo/components/form'
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
import {
  handleValidation,
  handleValidationErrros,
  initialRegisterValidations,
} from './utils'

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

const RegisterForm = ({ formInput }: RegisterDialogType) => {
  const [validations, setValidations] = useState(initialRegisterValidations)
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
                    className="pl-7 ring ring-primary text-center"
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
                  <FaAt className="absolute left-2 text-foreground" />
                  <Input
                    placeholder="Type your username"
                    className="pl-7 text-center"
                    autoFocus
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="mt-7">
            <DpButton
              disabled={
                !form.formState.isValid ||
                form.formState.isSubmitting ||
                form.formState.isSubmitSuccessful
              }
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
    </>
  )
}

export { RegisterForm }
