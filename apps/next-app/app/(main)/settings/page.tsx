import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@js-monorepo/components/tabs'
import { Separator } from '@js-monorepo/components/separator'
import { AccountSettings } from './account-settings'
import { NotificationPermissionComponent } from './notification-settings'

export default function SettingsPage() {
  return (
    <div className="px-2">
      <BackArrowWithLabel arrowClassName="sm:hidden">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          Settings
        </h1>
      </BackArrowWithLabel>

      <Tabs
        defaultValue="account"
        className="p-4 bg-background-secondary text-foreground-secondary rounded-md overflow-hidden text-white"
      >
        <Separator />
        <TabsList className="py-1 my-1">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <Separator />

        <TabsContent value="account" className="p-2">
          <AccountSettings></AccountSettings>
        </TabsContent>

        <TabsContent value="notifications" className="p-2">
          <NotificationPermissionComponent></NotificationPermissionComponent>
        </TabsContent>
      </Tabs>
    </div>
  )
}
