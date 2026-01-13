'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { DpButton } from '@js-monorepo/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@js-monorepo/components/ui/dialog'
import {
  Form,
  FormControl,
  FormErrorDisplay,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '@js-monorepo/components/ui/form'

import { MultiSelectDropdown } from '@js-monorepo/components/ui/mutli-select'
import { UpdateUserSchemaType, UserUpdateUserSchema } from '@js-monorepo/schemas'
import { AuthUserFullDto } from '@js-monorepo/types/auth'
import { useRoles } from './roles-queries'

interface UserEditDialogProps {
  user: AuthUserFullDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: UpdateUserSchemaType) => void
  isSaving?: boolean
}

export function UserEditDialog({ user, open, onOpenChange, onSave, isSaving }: UserEditDialogProps) {
  const { data: roles = [] } = useRoles()

  const form = useForm<UpdateUserSchemaType>({
    resolver: zodResolver(UserUpdateUserSchema),
    defaultValues: {
      username: '',
      roles: [],
    },
  })

  useEffect(() => {
    if (!user || roles.length === 0) return

    const roleIds = roles
      .filter((role) => user.userRole?.some((ur) => ur.role.name === role.name))
      .map((role) => role.id)

    form.reset({
      username: user.username,
      roles: roleIds,
    })
  }, [user, roles, form])

  const onSubmit = (values: UpdateUserSchemaType) => {
    const payload: UpdateUserSchemaType = {}

    if (form.formState.dirtyFields.username) {
      payload.username = values.username
    }
    if (form.formState.dirtyFields.roles) {
      payload.roles = values.roles
    }
    onSave(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Edit User: {user?.username}</DialogTitle>
              <DialogDescription>Update user details below.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormErrorDisplay errors={form.formState.errors} fields={{ username: 'Username' }} />
                  </FormItem>
                )}
              />

              {/* Roles */}
              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => {
                  const value: number[] = field.value ?? []
                  const selectedRoles = roles.filter((r) => value.includes(r.id))
                  return (
                    <FormItem>
                      <FormLabel>Roles</FormLabel>
                      <FormControl>
                        <MultiSelectDropdown
                          classNameTrigger="h-10"
                          options={roles}
                          selectedIds={value}
                          prompt={selectedRoles.map((r) => r.name).join(', ')}
                          onChange={(localRoles) => {
                            const newIds = localRoles.map((r) => r.id).sort()
                            const oldIds = [...value].sort()
                            const changed = newIds.length !== oldIds.length || newIds.some((id, i) => id !== oldIds[i])
                            if (changed) {
                              field.onChange(newIds)
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )
                }}
              />
            </div>

            <DialogFooter className="gap-2">
              <DpButton type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Cancel
              </DpButton>

              <DpButton type="submit" loading={isSaving} disabled={!form.formState.isDirty}>
                Save
              </DpButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
