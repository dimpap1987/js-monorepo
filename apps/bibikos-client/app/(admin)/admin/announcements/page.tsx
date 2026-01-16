import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { CreateAnnouncement } from './components/create-announcement'

export default async function AnnouncementsController() {
  return (
    <>
      <BackArrowWithLabel className="mb-2">
        <h2>Announcements</h2>
      </BackArrowWithLabel>

      <CreateAnnouncement></CreateAnnouncement>
    </>
  )
}
