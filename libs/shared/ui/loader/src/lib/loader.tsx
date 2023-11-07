import LoadingSpinnerComponent from './loading-spinner'

export interface LoaderProps {
  message?: string
  show?: boolean
}

export function Loader({ message, show }: LoaderProps) {
  return (
    <div
      className={`fixed left-0 w-screen h-screen
      flex items-center justify-center bg-black 
      bg-opacity-80 transform transition-transform
      duration-200 ${show ? 'scale-100' : 'scale-0'} z-30 select-none`}
    >
      <div className="text-white flex flex-col items-center justify-center transform -translate-y-20">
        <LoadingSpinnerComponent message="Loading..."></LoadingSpinnerComponent>
        {message && (
          <p>
            <small>{message}</small>
          </p>
        )}
      </div>
    </div>
  )
}

export default Loader
