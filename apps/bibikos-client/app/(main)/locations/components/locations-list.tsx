import { Location } from '../../../../lib/scheduling'
import { LocationCard } from './location-card'

interface LocationsListProps {
  locations: Location[]
  onEdit: (location: Location) => void
  onDelete: (locationId: number) => void
}

export function LocationsList({ locations, onEdit, onDelete }: LocationsListProps) {
  const activeLocations = locations.filter((l) => l.isActive)
  const inactiveLocations = locations.filter((l) => !l.isActive)

  return (
    <div className="space-y-6">
      {/* Active Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeLocations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            onEdit={() => onEdit(location)}
            onDelete={() => onDelete(location.id)}
          />
        ))}
      </div>

      {/* Inactive Locations */}
      {inactiveLocations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground-muted">Inactive Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onEdit={() => onEdit(location)}
                onDelete={() => onDelete(location.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
