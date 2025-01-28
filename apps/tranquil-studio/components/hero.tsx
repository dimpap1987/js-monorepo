import { BookButton } from './book-button'

function Hero() {
  return (
    <section className="bg-cover bg-center flex items-center justify-center text-center">
      <div className="bg-background-secondary p-4 sm:p-7 rounded-2xl shadow-lg shadow-black/50">
        <h1 className="mb-2 sm:mb-4 text-white">Welcome to Tranquil Studio</h1>
        <p className="text-gray-200 mb-4">
          Discover a peaceful oasis to work, relax, or create. Book your perfect experience today.
        </p>
        <BookButton></BookButton>
      </div>
    </section>
  )
}

export default Hero
