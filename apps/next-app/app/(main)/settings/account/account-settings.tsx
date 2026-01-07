'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from '@js-monorepo/auth/next/client'
import { DpButton } from '@js-monorepo/button'
import { Avatar, AvatarFallback, AvatarImage } from '@js-monorepo/components/ui/avatar'
import { Form, FormControl, FormErrorDisplay, FormField, FormItem, FormLabel } from '@js-monorepo/components/ui/form'
import { Input } from '@js-monorepo/components/ui/form'
import { useNotifications } from '@js-monorepo/notification'
import { EditUserSchema } from '@js-monorepo/schemas'
import { compressAvatar } from '@js-monorepo/utils/common'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { SettingsItem } from '../settings-items'
import { useUpdateUserAccount } from '../queries'
import { BackArrowWithLabel } from '@js-monorepo/back-arrow'

export function AccountSettings() {
  const { session, refreshSession, isAdmin } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const { addNotification } = useNotifications()
  const user = session?.user
  const updateUserAccountMutation = useUpdateUserAccount()

  const initUser = useMemo(
    () => ({
      username: user?.username || '',
      profileImage: user?.profile?.image || '',
    }),
    [user?.username, user?.profile?.image]
  )

  const form = useForm({
    defaultValues: initUser,
    resolver: zodResolver(EditUserSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (user) {
      form.reset(initUser)
    }
  }, [user, form, initUser])

  const onSubmit = async (data: { username: string; profileImage: string }) => {
    setIsEditing(false)
    form.clearErrors()

    try {
      await updateUserAccountMutation.mutateAsync(data)
      refreshSession()
      addNotification({
        message: 'Account successfully updated!',
        type: 'success',
      })
    } catch (error) {
      form.reset(initUser)
      addNotification({
        message: 'Something went wrong...',
        type: 'error',
      })
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    form.reset(initUser)
  }
  const profileImageWatch = form.watch('profileImage')

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <BackArrowWithLabel>
        <h2 className="mb-2">Account Settings</h2>
        <p className="text-sm text-foreground-muted">Manage your profile information</p>
      </BackArrowWithLabel>

      {/* Profile Section */}
      <Form {...form}>
        <SettingsItem label="Profile">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isEditing && form.formState.isValid && form.formState.isDirty) {
                e.preventDefault()
                form.handleSubmit(onSubmit)()
              }
            }}
          >
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <Controller
                  control={form.control}
                  name="profileImage"
                  render={({ field }) => (
                    <div className="relative">
                      <Avatar className="h-24 w-24 ring-2 ring-border ring-offset-2 ring-offset-background">
                        {profileImageWatch && <AvatarImage src={profileImageWatch} alt="user's picture" />}
                        <AvatarFallback className="bg-background-secondary text-lg font-semibold">
                          {user?.username?.charAt(0).toUpperCase() || 'NA'}
                        </AvatarFallback>
                      </Avatar>

                      {isEditing && (
                        <label
                          htmlFor="profileImage"
                          className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full cursor-pointer flex items-center justify-center h-9 w-9 text-sm font-medium border-2 border-background shadow-lg hover:brightness-90 transition-colors"
                        >
                          <input
                            {...form.register('profileImage')}
                            type="file"
                            id="profileImage"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files?.[0]) {
                                try {
                                  const base64Image = (await compressAvatar(e.target.files[0])) as string

                                  field.onChange(base64Image)
                                } catch (error) {
                                  console.error('Error converting file to Base64:', error)
                                }
                              }
                            }}
                          />
                          ✎
                        </label>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Username Field and Actions */}
              <div className="flex-1 w-full space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-sm font-medium text-foreground mb-2">Username</FormLabel>
                      <FormControl>
                        {isEditing ? (
                          <Input id="username" className="h-11" {...field} />
                        ) : (
                          <div className="h-11 px-4 py-2 bg-background-secondary text-foreground rounded-lg border border-border font-medium flex items-center shadow-sm">
                            {field.value || 'Not set'}
                          </div>
                        )}

                        <FormErrorDisplay
                          className="mt-2"
                          errors={form.formState.errors}
                          fields={{
                            username: 'Username',
                            profileImage: 'Profile Image',
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Edit/Save Buttons */}
                <div className="flex gap-3 justify-center sm:justify-end flex-wrap">
                  {isEditing ? (
                    <>
                      <DpButton onClick={handleCancel} variant="outline" className="w-full sm:w-auto">
                        Cancel
                      </DpButton>
                      <DpButton
                        disabled={!form.formState.isValid || !form.formState.isDirty}
                        variant="primary"
                        type="submit"
                        className="w-full sm:w-auto"
                      >
                        Save Changes
                      </DpButton>
                    </>
                  ) : (
                    <DpButton
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsEditing(true)
                      }}
                      className="w-full sm:w-auto "
                    >
                      Edit Profile
                    </DpButton>
                  )}
                </div>
              </div>
            </div>
          </form>
        </SettingsItem>
      </Form>

      {/* Account Metadata Section */}
      <SettingsItem label="Account Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="gap-4 flex">
            <dt className="text-sm font-medium text-foreground-muted content-center">Account Created</dt>
            <dd className="text-foreground font-medium">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'N/A'}
            </dd>
          </div>

          {isAdmin && (
            <div className="gap-4 flex">
              <dt className="text-sm font-medium text-foreground-muted content-center">Roles</dt>
              <dd className="text-foreground font-medium">
                {user?.roles && user.roles.length > 0 ? (
                  <span className="inline-flex items-center gap-2">
                    {user.roles.map((role: string) => (
                      <span key={role} className="px-2.5 py-1 bg-accent text-primary rounded-md text-xs font-semibold">
                        {role}
                      </span>
                    ))}
                  </span>
                ) : (
                  'None'
                )}
              </dd>
            </div>
          )}
        </div>
      </SettingsItem>
    </section>
  )
}
