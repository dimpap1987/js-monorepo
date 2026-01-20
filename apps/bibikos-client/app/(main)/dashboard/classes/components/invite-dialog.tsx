'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from '@js-monorepo/components/ui/badge'
import { Button } from '@js-monorepo/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@js-monorepo/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@js-monorepo/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@js-monorepo/components/ui/tabs'
import { Textarea } from '@js-monorepo/components/ui/textarea'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Clock, Loader2, Mail, Send, User, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  schedulingKeys,
  useCancelInvitation,
  useInvitationsForClass,
  useSendInvitation,
} from '../../../../../lib/scheduling/queries'
import type { Class, ClassInvitation } from '../../../../../lib/scheduling/types'

const inviteByUsernameSchema = z.object({
  username: z.string().min(1, 'Username is required').max(100),
  message: z.string().max(500).optional(),
})

const inviteByEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  message: z.string().max(500).optional(),
})

type InviteByUsernameForm = z.infer<typeof inviteByUsernameSchema>
type InviteByEmailForm = z.infer<typeof inviteByEmailSchema>

interface InviteDialogProps {
  classItem: Class
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteDialog({ classItem, open, onOpenChange }: InviteDialogProps) {
  const [activeTab, setActiveTab] = useState<'username' | 'email'>('username')
  const queryClient = useQueryClient()

  const sendInvitationMutation = useSendInvitation()
  const cancelInvitationMutation = useCancelInvitation()
  const { data: invitations, isLoading: isLoadingInvitations } = useInvitationsForClass(classItem.id)

  const usernameForm = useForm<InviteByUsernameForm>({
    resolver: zodResolver(inviteByUsernameSchema),
    defaultValues: { username: '', message: '' },
  })

  const emailForm = useForm<InviteByEmailForm>({
    resolver: zodResolver(inviteByEmailSchema),
    defaultValues: { email: '', message: '' },
  })

  const handleSubmitUsername = async (data: InviteByUsernameForm) => {
    try {
      await sendInvitationMutation.mutateAsync({
        classId: classItem.id,
        username: data.username,
        message: data.message || undefined,
      })
      toast.success(`Invitation sent to ${data.username}`)
      usernameForm.reset()
      queryClient.invalidateQueries({ queryKey: schedulingKeys.invitationsForClass(classItem.id) })
    } catch (error: any) {
      const message = error?.message || 'Failed to send invitation'
      if (message.includes('INVITATION_ALREADY_EXISTS')) {
        toast.error('This user has already been invited')
      } else {
        toast.error(message)
      }
    }
  }

  const handleSubmitEmail = async (data: InviteByEmailForm) => {
    try {
      await sendInvitationMutation.mutateAsync({
        classId: classItem.id,
        email: data.email,
        message: data.message || undefined,
      })
      toast.success(`Invitation sent to ${data.email}`)
      emailForm.reset()
      queryClient.invalidateQueries({ queryKey: schedulingKeys.invitationsForClass(classItem.id) })
    } catch (error: any) {
      const message = error?.message || 'Failed to send invitation'
      if (message.includes('INVITATION_ALREADY_EXISTS')) {
        toast.error('This email has already been invited')
      } else {
        toast.error(message)
      }
    }
  }

  const handleCancelInvitation = async (invitationId: number) => {
    try {
      await cancelInvitationMutation.mutateAsync(invitationId)
      toast.success('Invitation cancelled')
      queryClient.invalidateQueries({ queryKey: schedulingKeys.invitationsForClass(classItem.id) })
    } catch {
      toast.error('Failed to cancel invitation')
    }
  }

  const getStatusBadge = (status: ClassInvitation['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        )
      case 'ACCEPTED':
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <Check className="w-3 h-3" />
            Accepted
          </Badge>
        )
      case 'DECLINED':
        return (
          <Badge variant="destructive" className="gap-1">
            <X className="w-3 h-3" />
            Declined
          </Badge>
        )
      case 'EXPIRED':
        return (
          <Badge variant="outline" className="gap-1 text-foreground-muted">
            Expired
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite to {classItem.title}</DialogTitle>
          <DialogDescription>
            Send invitations to users by their username or email address. They will receive a notification.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'username' | 'email')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="username" className="gap-2">
              <User className="w-4 h-4" />
              By Username
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="w-4 h-4" />
              By Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="username" className="mt-4">
            <Form {...usernameForm}>
              <form onSubmit={usernameForm.handleSubmit(handleSubmitUsername)} className="space-y-4">
                <FormField
                  control={usernameForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={usernameForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add a personal message to the invitation..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>This message will be included in the invitation notification.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={sendInvitationMutation.isPending}>
                  {sendInvitationMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Invitation
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="email" className="mt-4">
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleSubmitEmail)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={emailForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add a personal message to the invitation..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>This message will be included in the invitation notification.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={sendInvitationMutation.isPending}>
                  {sendInvitationMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Invitation
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        {/* Sent Invitations List */}
        {invitations && invitations.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Sent Invitations ({invitations.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {invitations.map((invitation: ClassInvitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {invitation.invitedEmail ? (
                        <Mail className="w-4 h-4 text-primary" />
                      ) : (
                        <User className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{invitation.invitedUsername || invitation.invitedEmail}</p>
                      <p className="text-xs text-foreground-muted">
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invitation.status)}
                    {invitation.status === 'PENDING' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        onClick={() => handleCancelInvitation(invitation.id)}
                        disabled={cancelInvitationMutation.isPending}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoadingInvitations && (
          <div className="mt-6 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-foreground-muted" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
