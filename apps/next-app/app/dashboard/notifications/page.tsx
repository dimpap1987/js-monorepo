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
      <div className="">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Send User Notification</AccordionTrigger>
            <AccordionContent>
              <NotificationSender></NotificationSender>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Send Push Notification</AccordionTrigger>
            <AccordionContent>
              <PushNotificationSender></PushNotificationSender>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  )
}
