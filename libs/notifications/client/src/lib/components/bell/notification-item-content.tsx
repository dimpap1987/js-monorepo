import { FaExternalLinkAlt } from 'react-icons/fa'

const NoticationItemContext = ({ message }: { message: string }) => {
  if (!message) return null

  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls: string[] = message.match(urlRegex) || []

  return message.split(urlRegex).map((part, index) => {
    if (urls.includes(part)) {
      return (
        <span key={index} className="relative inline-block pr-4 pt-1 select-all">
          <span className="text-blue-500 underline">{part}</span>
          <FaExternalLinkAlt
            className="absolute right-0 top-[-3px] text-xs text-gray-400"
            onClick={(e) => {
              e.stopPropagation()
              window.open(part, '_blank', 'noopener,noreferrer') // Open URL in new tab
            }}
          />
        </span>
      )
    }
    return part
  })
}

export { NoticationItemContext }
