'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from '@js-monorepo/auth/next/client'
import { DpButton } from '@js-monorepo/button'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@js-monorepo/components/avatar'
import {
  Form,
  FormControl,
  FormErrorDisplay,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '@js-monorepo/components/form'
import { useNotifications } from '@js-monorepo/notification'
import { EditUserSchema } from '@js-monorepo/schemas'
import { compressAvatar } from '@js-monorepo/utils/common'
import { apiClient } from '@js-monorepo/utils/http'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { SettingsItem } from './settings-items'

export function AccountSettings() {
  const {
    session: { user },
    refreshSession,
    isAdmin,
  } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const { addNotification } = useNotifications()

  const initUser = {
    username: user?.username || '',
    profileImage: user?.profile?.image || '',
  }

  const form = useForm({
    defaultValues: initUser,
    resolver: zodResolver(EditUserSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (user) {
      form.reset(initUser)
    }
  }, [user, form])

  const onSubmit = async (data: { username: string; profileImage: string }) => {
    setIsEditing(false)
    form.clearErrors()

    const response = await apiClient.patch('/users', data)
    if (response.ok) {
      refreshSession()
      addNotification({
        message: 'Account successfully updated!',
        type: 'success',
      })
    } else {
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
    <section className="p-2 space-y-6 text-white min-w-[200px]">
      {/* Profile Section */}
      <Form {...form}>
        <SettingsItem label="Profile">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 place-items-center sm:place-items-start">
              {/* Profile Image */}
              <div className="relative flex justify-center self-center">
                <Controller
                  control={form.control}
                  name="profileImage"
                  render={({ field }) => (
                    <div className="relative flex justify-center self-center">
                      <Avatar className="h-24 w-24">
                        {profileImageWatch && (
                          <AvatarImage
                            src={profileImageWatch}
                            alt="user's picture"
                          />
                        )}
                        <AvatarFallback className="bg-background">
                          NA
                        </AvatarFallback>
                      </Avatar>

                      {isEditing && (
                        <label
                          htmlFor="profileImage"
                          className="absolute bottom-0 right-0 bg-background rounded-full cursor-pointer flex items-center justify-center h-8 w-8 text-sm font-medium border border-border text-foreground"
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
                                  const base64Image = (await compressAvatar(
                                    e.target.files[0]
                                  )) as string

                                  field.onChange(base64Image)
                                } catch (error) {
                                  console.error(
                                    'Error converting file to Base64:',
                                    error
                                  )
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

              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
                      Username
                    </FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Input
                          id="username"
                          className="h-10 w-full"
                          {...field}
                        />
                      ) : (
                        <p className="w-full h-10 px-6 py-2 bg-background text-secondary rounded-xl border border-border font-semibold flex items-center shadow-md">
                          {field.value}
                        </p>
                      )}

                      <FormErrorDisplay
                        className="mt-4 sm:min-h-10"
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

              <div className="hidden sm:block"></div>

              {/* Edit/Save Buttons */}
              <div className="self-center sm:self-end sm:justify-self-end w-full">
                {isEditing ? (
                  <div className="flex gap-3 flex-wrap sm:flex-nowrap sm:justify-end">
                    <DpButton
                      disabled={
                        !form.formState.isValid || !form.formState.isDirty
                      }
                      variant="primary"
                      type="submit"
                      className="flex-1"
                    >
                      Save
                    </DpButton>
                    <DpButton
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </DpButton>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <DpButton
                      className="flex-1"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsEditing(true)
                      }}
                    >
                      Edit Profile
                    </DpButton>
                  </div>
                )}
              </div>
            </div>
          </form>
        </SettingsItem>
      </Form>

      {/* Account Metadata Section */}
      <SettingsItem label="Account details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              Account Created
            </dt>
            <dd className="mt-1 font-semibold">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : 'N/A'}
            </dd>
          </div>

          {isAdmin && (
            <div>
              <dt className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Roles
              </dt>
              <dd className="mt-1 font-semibold">
                {user?.roles.join(', ') || 'None'}
              </dd>
            </div>
          )}
        </div>
      </SettingsItem>
    </section>
  )
}
