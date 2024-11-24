import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { NotificationSender } from './components/notification-sender'
import { PushNotificationSender } from './components/push-notification-sender'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@js-monorepo/components/accordion'

export default async function NotificationsController() {
  return (
    <>
      <BackArrowWithLabel arrowClassName="sm:hidden">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          Manage Notifications
        </h1>
      </BackArrowWithLabel>

      <div className="p-4">
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Send User Notification</AccordionTrigger>
            <AccordionContent className="p-4">
              <NotificationSender></NotificationSender>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Send Push Notification</AccordionTrigger>
            <AccordionContent className="p-4">
              <PushNotificationSender></PushNotificationSender>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  )
}
