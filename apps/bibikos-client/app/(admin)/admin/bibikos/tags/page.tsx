import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { TagsTable } from './components/tags-table'

export default function TagsAdminPage() {
  return (
    <>
      <BackArrowWithLabel className="mb-4">
        <h2>Tags Management</h2>
      </BackArrowWithLabel>
      <p className="text-sm text-muted-foreground mb-6">
        Manage tags and categories used across the Bibikos platform. Tags can be assigned to classes, organizers,
        locations, and participants.
      </p>
      <TagsTable />
    </>
  )
}
