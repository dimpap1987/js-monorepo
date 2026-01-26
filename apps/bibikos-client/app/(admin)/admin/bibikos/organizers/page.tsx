import { OrganizersTable } from './components/organizers-table'

export default function OrganizersAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organizer Badges</h1>
        <p className="text-muted-foreground">Assign special badges to organizers to highlight their achievements</p>
      </div>
      <OrganizersTable />
    </div>
  )
}
