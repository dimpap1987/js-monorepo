import { PropsWithChildren } from 'react'

export function SettingsItem({
  children,
  className,
  label,
}: PropsWithChildren & { className?: string; label: string }) {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold mb-4">{label}</h2>
      <div className="border rounded-lg p-2 sm:p-4 shadow-md border-border overflow-x-hidden">
        <div className="px-2 py-4 sm:px-3">{children}</div>
      </div>
    </div>
  )
}
