import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { CreateAnnouncement } from './components/create-announcement'

export default async function AnnouncementsController() {
  return (
    <>
      <BackArrowWithLabel arrowClassName="sm:hidden">
        <h2 className="text-center sm:text-left">Announcements</h2>
      </BackArrowWithLabel>

      <CreateAnnouncement></CreateAnnouncement>
    </>
  )
}
