import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { FeatureFlagsTable } from './table'

export default function FeatureFlagsAdminPage() {
  return (
    <>
      <BackArrowWithLabel className="mb-2">
        <h2>Feature Flags</h2>
      </BackArrowWithLabel>
      <FeatureFlagsTable />
    </>
  )
}
