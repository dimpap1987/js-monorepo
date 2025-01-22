import { cn } from '@js-monorepo/ui/util'
import * as React from 'react'
import {
  Controller,
  ControllerProps,
  FieldErrors,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from 'react-hook-form'
import { FaRegTimesCircle } from 'react-icons/fa'

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

type FormErrorMessageProps = {
  errors?: string[]
  className?: string
}

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId()

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('space-y-2 mb-4 overflow-hidden', className)} {...props} />
      </FormItemContext.Provider>
    )
  }
)
FormItem.displayName = 'FormItem'

const FormLabel = React.forwardRef<HTMLLabelElement, React.ButtonHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    const { error, formItemId } = useFormField()

    return (
      <label
        ref={ref}
        className={cn(`font-semibold ${error ? 'text-destructive' : ''}`, className)}
        htmlFor={formItemId}
        {...props}
      />
    )
  }
)
FormLabel.displayName = 'FormLabel'

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <div
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    ></div>
  )
})
FormControl.displayName = 'FormControl'

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField()

    return (
      <p ref={ref} id={formDescriptionId} className={cn('text-[0.8rem] text-muted-foreground', className)} {...props} />
    )
  }
)
FormDescription.displayName = 'FormDescription'

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message) : children

    return (
      <div className="h-5">
        {body && (
          <p
            ref={ref}
            id={formMessageId}
            className={cn('text-[0.8rem] font-medium text-foreground h-5', className)}
            {...props}
          >
            {body}
          </p>
        )}
      </div>
    )
  }
)
FormMessage.displayName = 'FormMessage'

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'w-full border-2 border-border rounded-lg text-foreground px-6 py-2 text-base hover:border-primary cursor-pointer shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

//TODO remove - DEPRECATED
const FormErrorMessage = React.forwardRef<HTMLInputElement, FormErrorMessageProps>(({ className, errors }, ref) => {
  return (
    <div className={cn('min-h-5', className)}>
      {errors?.length && errors?.length > 0 && (
        <div className="rounded-md text-sm text-inherit">
          {Array.isArray(errors) &&
            errors?.map((errorMessage, index) => (
              <div key={index} className="flex items-center gap-2 py-1">
                <FaRegTimesCircle className="text-red-600 text-xl shrink-0" />
                <p className="font-semibold">{errorMessage}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  )
})

interface FormErrorProps {
  errors: FieldErrors
  fields: Record<string, string> // Mapping of field names to display labels
  className?: string
}

const FormErrorDisplay: React.FC<FormErrorProps> = ({ errors, fields, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Object.entries(fields).map(([fieldKey, label]) => {
        const error = errors[fieldKey]
        return (
          error && (
            <p key={fieldKey} className="text-sm text-red-500 tracking-wider">
              {error.message?.toString()}
            </p>
          )
        )
      })}
    </div>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  Input,
  FormErrorMessage,
  FormErrorDisplay,
}
