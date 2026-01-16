import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { ContactMessagesTable } from './contact-messages-table'

export default function ContactMessagesDashboardPage() {
  return (
    <>
      <BackArrowWithLabel className="mb-2">
        <h2>Contact Messages</h2>
      </BackArrowWithLabel>
      <ContactMessagesTable />
    </>
  )
}
