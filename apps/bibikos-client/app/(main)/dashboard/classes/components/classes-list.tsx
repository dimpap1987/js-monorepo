import { Class, Location } from '../../../../../lib/scheduling'
import { ClassCard } from './class-card'

interface ClassesListProps {
  classes: Class[]
  locations: Location[]
  onEdit: (classItem: Class) => void
  onDelete: (classId: number) => void
  onInvite: (classItem: Class) => void
}

export function ClassesList({ classes, locations, onEdit, onDelete, onInvite }: ClassesListProps) {
  const activeClasses = classes.filter((c) => c.isActive)
  const inactiveClasses = classes.filter((c) => !c.isActive)

  return (
    <div className="space-y-6">
      {/* Active Classes */}
      {activeClasses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              locations={locations}
              onEdit={() => onEdit(classItem)}
              onDelete={() => onDelete(classItem.id)}
              onInvite={classItem.isPrivate ? () => onInvite(classItem) : undefined}
            />
          ))}
        </div>
      )}

      {/* Inactive Classes */}
      {inactiveClasses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground-muted">Inactive Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveClasses.map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
                locations={locations}
                onEdit={() => onEdit(classItem)}
                onDelete={() => onDelete(classItem.id)}
                onInvite={classItem.isPrivate ? () => onInvite(classItem) : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
