import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { NotificationSender } from './components/notification-sender'
import { PushNotificationSender } from './components/push-notification-sender'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@js-monorepo/components/accordion'

export default async function NotificationsController() {
  return (
    <>
      <BackArrowWithLabel arrowClassName="sm:hidden">
        <h2 className="text-center sm:text-left">Manage Notifications</h2>
      </BackArrowWithLabel>

      <div className="p-4">
        <Accordion type="multiple" className="w-full space-y-2">
          <AccordionItem value="item-1" className="border border-border rounded-lg px-4">
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              Send User Notification
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <NotificationSender></NotificationSender>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border border-border rounded-lg px-4">
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              Send Push Notification
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <PushNotificationSender></PushNotificationSender>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  )
}
