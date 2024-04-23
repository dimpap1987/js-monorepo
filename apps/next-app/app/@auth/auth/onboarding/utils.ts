import { UseFormReturn } from 'react-hook-form'
import { RegisterDialogErrorComponentType } from './types'

export function isValidType(
  value: any
): value is 'too_small' | 'too_big' | 'custom' {
  return value === 'too_small' || value === 'too_big' || value === 'custom'
}

export const handleValidation = async (
  form: UseFormReturn<any>,
  callback: React.Dispatch<
    React.SetStateAction<RegisterDialogErrorComponentType[]>
  >
) => {
  if (form.formState.isValid) {
    callback((prev) =>
      prev.map((v) => ({
        message: v.message,
        status: 'valid',
        type: v.type,
      }))
    )
  } else if (!form.formState.isValid) {
    const usernameErrors = Object.values(form.formState?.errors ?? {})

    const newValidations: RegisterDialogErrorComponentType[] =
      usernameErrors.map((error) => ({
        status: 'invalid',
        type: (isValidType(error?.type) ? error?.type : 'custom') || 'custom',
        message:
          typeof error?.message === 'string' ? error?.message : 'Unknown error',
      }))

    callback((prev) => {
      const filteredValidations = prev.filter(
        (validation) =>
          !newValidations?.some(
            (newValidation) => newValidation.type === validation.type
          )
      )
      const validationOrder = ['too_small', 'too_big']

      const orderedVal = [...newValidations, ...filteredValidations].sort(
        (a, b) =>
          validationOrder.indexOf(a.type) - validationOrder.indexOf(b.type)
      )
      return orderedVal
    })
  }
}
