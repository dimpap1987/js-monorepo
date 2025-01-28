import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { IconType } from 'react-icons/lib'

const DynamicIcon = ({ iconName }: { iconName: string }) => {
  const IconComponent = dynamic(() => import(`react-icons/md`).then((mod) => mod[iconName] as IconType))

  return (
    <Suspense>
      <IconComponent />
    </Suspense>
  )
}

export default DynamicIcon
