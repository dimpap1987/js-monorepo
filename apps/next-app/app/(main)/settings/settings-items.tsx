import { PropsWithChildren } from 'react'

export function SettingsItem({
  children,
  className,
  label,
}: PropsWithChildren & { className?: string; label: string }) {
  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4">{label}</h2>
      <div className="border rounded-md p-4 shadow-sm border-border overflow-x-hidden">
        <div className="px-3">{children}</div>
      </div>
    </div>
  )
}
