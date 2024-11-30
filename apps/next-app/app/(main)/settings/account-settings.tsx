'use client'

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
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '@js-monorepo/components/form'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { SettingsItem } from './settings-items'
import { toBase64 } from '@js-monorepo/utils/common'

export function AccountSettings() {
  const { user, refreshSession, isAdmin } = useSession()
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm({
    defaultValues: {
      username: user?.username || '',
      profileImage: user?.profile?.image || '',
    },
  })

  const onSubmit = (data: { username: string; profileImage: string }) => {
    console.log('Form Data:', data)
    setIsEditing(false)
    // refreshSession()
  }

  const handleCancel = () => {
    setIsEditing(false)
    form.reset({
      username: user?.username || '',
      profileImage: user?.profile?.image || '',
    })
  }

  return (
    <section className="p-2 space-y-6 text-white">
      {/* Profile Section */}
      <Form {...form}>
        <SettingsItem label="Profile">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 place-items-start">
              {/* Profile Image */}
              <div className="relative flex justify-center">
                <Avatar className="h-24 w-24">
                  {form.watch('profileImage') && (
                    <AvatarImage
                      src={form.watch('profileImage')}
                      alt={`user's picture`}
                    />
                  )}
                  <AvatarFallback className="bg-background">NA</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label
                    htmlFor="profileImage"
                    className="absolute bottom-0 right-0 bg-background rounded-full cursor-pointer flex items-center justify-center h-8 w-8 text-sm font-medium border border-border"
                  >
                    <input
                      type="file"
                      id="profileImage"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files?.[0]) {
                          try {
                            const base64Image = await toBase64(
                              e.target.files[0]
                            )
                            form.setValue('profileImage', base64Image)
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

              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
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
                        <p className="w-full px-4 py-2 bg-background text-secondary rounded-xl border border-border font-semibold flex items-center shadow-md">
                          {field.value}
                        </p>
                      )}
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Edit/Save Buttons */}
              <div className="self-end justify-self-end w-full">
                {isEditing ? (
                  <div className="flex gap-3 flex-wrap justify-end">
                    <DpButton
                      onClick={handleCancel}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </DpButton>
                    <DpButton type="submit" className="w-full sm:w-auto">
                      Save
                    </DpButton>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <DpButton
                      className="w-full sm:w-auto"
                      type="button" // Prevents form submission
                      onClick={(e) => {
                        e.preventDefault() // Prevents form submission
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
