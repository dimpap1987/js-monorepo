import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { ContactMessagesTable } from './contact-messages-table'

export default function ContactMessagesDashboardPage() {
  return (
    <>
      <BackArrowWithLabel arrowClassName="sm:hidden">
        <h2 className="text-center sm:text-left">Contact Messages</h2>
      </BackArrowWithLabel>
      <ContactMessagesTable />
    </>
  )
}
