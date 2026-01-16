'use client'

import { DpButton } from '@js-monorepo/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@js-monorepo/components/table'
import { Input } from '@js-monorepo/components/ui/form'
import { Switch } from '@js-monorepo/components/ui/switch'
import { useNotifications } from '@js-monorepo/notification'
import { FeatureFlagDto } from '@js-monorepo/types/feature-flags'
import { useState } from 'react'
import { useFeatureFlagsAdmin, useUpsertFeatureFlag } from './queries'

interface EditableFlag extends Omit<FeatureFlagDto, 'rollout'> {
  rollout: number
}

function FlagRow({ flag, onSave }: { flag: EditableFlag; onSave: (flag: EditableFlag) => Promise<void> }) {
  const [local, setLocal] = useState<EditableFlag>(flag)
  const [isDirty, setIsDirty] = useState(false)

  const handleChange = (patch: Partial<EditableFlag>) => {
    setLocal((prev) => {
      const next = { ...prev, ...patch }
      setIsDirty(
        next.enabled !== flag.enabled ||
          next.rollout !== flag.rollout ||
          (next.description ?? '') !== (flag.description ?? '')
      )
      return next
    })
  }

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{flag.key}</TableCell>
      <TableCell>
        <Input
          value={local.description ?? ''}
          onChange={(e) => handleChange({ description: e.target.value })}
          placeholder="Optional description"
          className="h-9"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch checked={local.enabled} onCheckedChange={(checked) => handleChange({ enabled: checked })} />
        </div>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          max={100}
          value={local.rollout}
          onChange={(e) =>
            handleChange({
              rollout: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
            })
          }
          className="h-9 w-24"
        />
      </TableCell>
      <TableCell>
        <DpButton
          size="small"
          variant={isDirty ? 'accent' : 'outline'}
          disabled={!isDirty}
          onClick={() => onSave(local)}
        >
          Save
        </DpButton>
      </TableCell>
    </TableRow>
  )
}

export function FeatureFlagsTable() {
  const { data, isLoading } = useFeatureFlagsAdmin()
  const { addNotification } = useNotifications()
  const upsertMutation = useUpsertFeatureFlag()

  const [newFlag, setNewFlag] = useState<EditableFlag>({
    key: '',
    enabled: false,
    rollout: 100,
    description: '',
  })

  const flags: EditableFlag[] = data ? Object.values(data).map((f) => ({ ...f, rollout: f.rollout ?? 100 })) : []

  const handleSaveFlag = async (flag: EditableFlag) => {
    try {
      await upsertMutation.mutateAsync({
        key: flag.key.trim(),
        enabled: flag.enabled,
        rollout: Number.isFinite(flag.rollout) ? flag.rollout : 100,
        description: flag.description ?? undefined,
      })
      addNotification({
        message: `Feature flag "${flag.key}" saved`,
        type: 'success',
      })
    } catch (error: any) {
      addNotification({
        message: `Failed to save feature flag "${flag.key}"`,
        description: error?.message,
        type: 'error',
      })
    }
  }

  const handleCreateFlag = async () => {
    if (!newFlag.key.trim()) {
      addNotification({ message: 'Key is required', type: 'error' })
      return
    }
    await handleSaveFlag(newFlag)
    setNewFlag({
      key: '',
      enabled: false,
      rollout: 100,
      description: '',
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[140px]">Enabled</TableHead>
              <TableHead className="w-[160px]">Rollout %</TableHead>
              <TableHead className="w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Loading feature flags...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && flags.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No feature flags defined yet.
                </TableCell>
              </TableRow>
            )}
            {flags.map((flag) => (
              <FlagRow key={flag.key} flag={flag} onSave={handleSaveFlag} />
            ))}
            {/* New flag row */}
            <TableRow className="bg-muted/40">
              <TableCell>
                <Input
                  placeholder="new-feature.key"
                  value={newFlag.key}
                  onChange={(e) => setNewFlag((prev) => ({ ...prev, key: e.target.value }))}
                  className="h-9"
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Optional description"
                  value={newFlag.description ?? ''}
                  onChange={(e) => setNewFlag((prev) => ({ ...prev, description: e.target.value }))}
                  className="h-9"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newFlag.enabled}
                    onCheckedChange={(checked) => setNewFlag((prev) => ({ ...prev, enabled: checked }))}
                  />
                </div>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={newFlag.rollout}
                  onChange={(e) =>
                    setNewFlag((prev) => ({
                      ...prev,
                      rollout: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                    }))
                  }
                  className="h-9 w-24"
                />
              </TableCell>
              <TableCell>
                <DpButton size="small" onClick={handleCreateFlag} disabled={upsertMutation.isPending}>
                  Add
                </DpButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
