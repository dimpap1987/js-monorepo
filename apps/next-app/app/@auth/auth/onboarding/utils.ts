import { FieldErrors, UseFormReturn } from 'react-hook-form'
import { RegisterDialogErrorComponentType } from './types'
import { registerUserSchemaConfig } from '@js-monorepo/schemas'

export const initialRegisterValidations: RegisterDialogErrorComponentType[] = [
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
  {
    status: 'untouched',
    type: 'invalid_string',
    message: registerUserSchemaConfig.MAX_ERROR_REGEX,
  },
]

export function isValidType(
  value: any
): value is RegisterDialogErrorComponentType['type'] {
  return initialRegisterValidations.some(
    (validation) => validation.type === value || value === 'custom'
  )
}

export const handleValidationErrros = (
  errors: FieldErrors<any> | string[],
  callback: React.Dispatch<
    React.SetStateAction<RegisterDialogErrorComponentType[]>
  >
) => {
  const formErrors = Object.values(errors ?? {})
  const validationErrors: RegisterDialogErrorComponentType[] = formErrors.map(
    (error: any) => ({
      status: 'invalid',
      type: (isValidType(error?.type) ? error?.type : 'custom') || 'custom',
      message:
        typeof error?.message === 'string' ? error?.message : 'Unknown error',
    })
  )

  callback((prev) => {
    // filter the validations with no error
    const filteredValidations = prev.filter(
      (validation) =>
        !validationErrors?.some(
          (newValidation) => newValidation.type === validation.type
        )
    )

    // Map over filtered validations, update status to 'valid' for invalid ones
    const updatedValidations: RegisterDialogErrorComponentType[] =
      filteredValidations.map((validation) =>
        validation.status === 'invalid'
          ? { ...validation, status: 'valid' }
          : validation
      )

    //Set ordering
    const validationOrderTypes = initialRegisterValidations.map((v) => v.type)
    const orderedVal = [...updatedValidations, ...validationErrors].sort(
      (a, b) =>
        validationOrderTypes.indexOf(a.type) -
        validationOrderTypes.indexOf(b.type)
    )
    return orderedVal
  })
}

export const handleValidation = async (
  form: UseFormReturn<any>,
  callback: React.Dispatch<
    React.SetStateAction<RegisterDialogErrorComponentType[]>
  >
) => {
  if (form.formState.isValid) {
    callback((prev) =>
      prev
        .filter((v) => v.type !== 'custom')
        .map((v) => ({
          message: v.message,
          status: 'valid',
          type: v.type,
        }))
    )
  } else if (!form.formState.isValid) {
    handleValidationErrros(form.formState?.errors, callback)
  }
}
