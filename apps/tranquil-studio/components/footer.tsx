function Footer() {
  return (
    <footer className="py-3 bg-background-secondary text-gray-300 rounded-t-md">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Tranquil Studio. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
