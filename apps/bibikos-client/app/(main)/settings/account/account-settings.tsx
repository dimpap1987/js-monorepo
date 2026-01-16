'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from '@js-monorepo/auth/next/client'
import { DpButton } from '@js-monorepo/button'
import { Avatar, AvatarFallback, AvatarImage } from '@js-monorepo/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@js-monorepo/components/ui/card'
import { Form, FormControl, FormErrorDisplay, FormField, FormItem, FormLabel } from '@js-monorepo/components/ui/form'
import { Input } from '@js-monorepo/components/ui/form'
import { useNotifications } from '@js-monorepo/notification'
import { EditUserSchema } from '@js-monorepo/schemas'
import { compressAvatar } from '@js-monorepo/utils/common'
import { formatForUser } from '@js-monorepo/utils/date'
import { useTimezone } from '@js-monorepo/next/hooks'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useUpdateUserAccount, useUserProfile } from '../queries'
import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { Camera, User, Calendar, Shield } from 'lucide-react'
import { cn } from '@js-monorepo/ui/util'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'

export function AccountSettings() {
  const { session, refreshSession, isAdmin } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const { addNotification } = useNotifications()
  const user = session?.user
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile()
  const updateUserAccountMutation = useUpdateUserAccount()
  const userTimezone = useTimezone()

  const initUser = useMemo(
    () => ({
      username: user?.username || '',
      profileImage: user?.profile?.image || '',
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
    }),
    [user?.username, user?.profile?.image, userProfile?.firstName, userProfile?.lastName]
  )

  const form = useForm({
    defaultValues: initUser,
    resolver: zodResolver(EditUserSchema),
    mode: 'onChange',
  })

  // Ensure firstName and lastName are never empty strings (required fields)
  useEffect(() => {
    if (!isProfileLoading && userProfile) {
      const currentFirstName = form.getValues('firstName')
      const currentLastName = form.getValues('lastName')

      // If fields are empty and we have data from profile, set them
      if (!currentFirstName && userProfile.firstName) {
        form.setValue('firstName', userProfile.firstName)
      }
      if (!currentLastName && userProfile.lastName) {
        form.setValue('lastName', userProfile.lastName)
      }
    }
  }, [userProfile, isProfileLoading, form])

  useEffect(() => {
    if (user) {
      form.reset(initUser)
    }
  }, [user, form, initUser])

  const onSubmit = async (data: { username: string; profileImage: string; firstName: string; lastName: string }) => {
    // Ensure firstName and lastName are not empty
    if (!data.firstName.trim() || !data.lastName.trim()) {
      addNotification({
        message: 'First name and last name are required',
        type: 'error',
      })
      return
    }
    setIsEditing(false)
    form.clearErrors()

    try {
      await updateUserAccountMutation.mutateAsync(data)
      refreshSession()
      addNotification({
        message: 'Account successfully updated!',
        type: 'success',
      })
    } catch (error: any) {
      form.reset(initUser)
      addNotification({
        message: error?.message ?? 'Something went wrong...',
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
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Page Header */}
      <div className="px-1">
        <BackArrowWithLabel>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1.5">Account Settings</h1>
          <p className="text-sm sm:text-base text-foreground-muted">Manage your profile information</p>
        </BackArrowWithLabel>
      </div>

      {/* Profile Section */}
      <Form {...form}>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Profile</CardTitle>
            </div>
            <CardDescription>Update your profile picture and username</CardDescription>
          </CardHeader>
          <CardContent>
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
                <div className="flex-shrink-0 sm:mt-10">
                  <Controller
                    control={form.control}
                    name="profileImage"
                    render={({ field }) => (
                      <div className="relative group">
                        <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-2 ring-border ring-offset-2 ring-offset-background transition-all duration-200 group-hover:ring-primary/50">
                          {profileImageWatch && <AvatarImage src={profileImageWatch} alt="user's picture" />}
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-2xl sm:text-3xl font-bold text-primary">
                            {user?.username?.charAt(0).toUpperCase() || 'NA'}
                          </AvatarFallback>
                        </Avatar>

                        {isEditing && (
                          <label
                            htmlFor="profileImage"
                            className={cn(
                              'absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full cursor-pointer',
                              'flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11',
                              'border-3 border-background shadow-lg hover:shadow-xl',
                              'hover:scale-110 active:scale-95 transition-all duration-200',
                              'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2'
                            )}
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
                            <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                          </label>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Username and Name Fields */}
                <div className="flex-1 w-full space-y-5">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-sm font-semibold text-foreground mb-2.5">Username</FormLabel>
                        <FormControl>
                          {isEditing ? (
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-foreground-muted font-medium">
                                @
                              </span>
                              <Input
                                id="username"
                                className="h-11 sm:h-12 text-base pl-7"
                                placeholder="Enter your username"
                                {...field}
                              />
                            </div>
                          ) : (
                            <div className="h-11 sm:h-12 px-4 py-2.5 bg-background-secondary/50 text-foreground rounded-lg border border-border/50 font-medium flex items-center shadow-sm transition-colors hover:bg-background-secondary">
                              <span className="text-foreground-muted pr-1">@</span>
                              {field.value || 'Anonymous'}
                            </div>
                          )}
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* First Name and Last Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                    {isProfileLoading ? (
                      <>
                        <div className="w-full min-w-0">
                          <Skeleton className="h-4 w-24 mb-2.5" />
                          <Skeleton className="h-11 sm:h-12 w-full rounded-lg" />
                        </div>
                        <div className="w-full min-w-0">
                          <Skeleton className="h-4 w-24 mb-2.5" />
                          <Skeleton className="h-11 sm:h-12 w-full rounded-lg" />
                        </div>
                      </>
                    ) : (
                      <>
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem className="w-full min-w-0">
                              <FormLabel className="text-sm font-semibold text-foreground mb-2.5 flex flex-wrap items-center gap-1">
                                <span>First Name</span>
                              </FormLabel>
                              <FormControl>
                                {isEditing ? (
                                  <Input
                                    id="firstName"
                                    className="h-11 sm:h-12 text-base w-full min-w-0"
                                    placeholder="Enter your first name"
                                    required
                                    {...field}
                                    value={field.value || ''}
                                  />
                                ) : (
                                  <div className="h-11 sm:h-12 px-4 py-2.5 bg-background-secondary/50 text-foreground rounded-lg border border-border/50 font-medium flex items-center shadow-sm transition-colors hover:bg-background-secondary min-w-0 overflow-hidden">
                                    <span className="truncate">
                                      {field.value || <span className="text-foreground-muted italic">Not set</span>}
                                    </span>
                                  </div>
                                )}
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem className="w-full min-w-0">
                              <FormLabel className="text-sm font-semibold text-foreground mb-2.5 flex flex-wrap items-center gap-1">
                                <span>Last Name</span>
                              </FormLabel>
                              <FormControl>
                                {isEditing ? (
                                  <Input
                                    id="lastName"
                                    className="h-11 sm:h-12 text-base w-full min-w-0"
                                    placeholder="Enter your last name"
                                    required
                                    {...field}
                                    value={field.value || ''}
                                  />
                                ) : (
                                  <div className="h-11 sm:h-12 px-4 py-2.5 bg-background-secondary/50 text-foreground rounded-lg border border-border/50 font-medium flex items-center shadow-sm transition-colors hover:bg-background-secondary min-w-0 overflow-hidden">
                                    <span className="truncate">
                                      {field.value || <span className="text-foreground-muted italic">Not set</span>}
                                    </span>
                                  </div>
                                )}
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>

                  <FormErrorDisplay
                    className="mt-2"
                    errors={form.formState.errors}
                    fields={{
                      username: 'Username',
                      profileImage: 'Profile Image',
                      firstName: 'First Name',
                      lastName: 'Last Name',
                    }}
                  />

                  {/* Edit/Save Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {isEditing ? (
                      <>
                        <DpButton
                          onClick={handleCancel}
                          variant="outline"
                          className="w-full sm:w-auto order-2 sm:order-1"
                        >
                          Cancel
                        </DpButton>
                        <DpButton
                          disabled={!form.formState.isValid || !form.formState.isDirty}
                          variant="primary"
                          type="submit"
                          className="w-full sm:w-auto order-1 sm:order-2"
                          loading={updateUserAccountMutation.isPending}
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
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        Edit Profile
                      </DpButton>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </Form>

      {/* Account Metadata Section */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Account Details</CardTitle>
          </div>
          <CardDescription>View your account information and status</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 min-w-0">
            {/* Account Created */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 rounded-lg bg-background-secondary/30 border border-border/50 min-w-0 overflow-hidden w-full">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <dt className="text-sm font-semibold text-foreground-muted whitespace-nowrap flex-shrink-0">
                  Account Created
                </dt>
              </div>
              <dd className="text-foreground font-semibold text-base sm:text-sm sm:ml-auto min-w-0 flex-1 sm:flex-initial overflow-hidden w-full sm:w-auto">
                <span className="block truncate text-right sm:text-left w-full">
                  {user?.createdAt ? formatForUser(user.createdAt, userTimezone, 'PPP') : 'N/A'}
                </span>
              </dd>
            </div>

            {/* Roles - Admin Only */}
            {isAdmin && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 rounded-lg bg-background-secondary/30 border border-border/50 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <dt className="text-sm font-semibold text-foreground-muted whitespace-nowrap">Roles</dt>
                </div>
                <dd className="text-foreground font-semibold text-base sm:text-sm sm:ml-auto min-w-0">
                  {user?.roles && user.roles.length > 0 ? (
                    <span className="inline-flex items-center gap-2 flex-wrap">
                      {user.roles.map((role: string) => (
                        <span
                          key={role}
                          className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold border border-primary/20 whitespace-nowrap"
                        >
                          {role}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="text-foreground-muted">None</span>
                  )}
                </dd>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
