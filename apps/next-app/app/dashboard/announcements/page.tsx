import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { CreateAnnouncement } from './components/create-announcement'

export default async function AnnouncementsController() {
  return (
    <>
      <BackArrowWithLabel arrowClassName="sm:hidden">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          Announcements
        </h1>
      </BackArrowWithLabel>

      <CreateAnnouncement></CreateAnnouncement>
    </>
  )
}
