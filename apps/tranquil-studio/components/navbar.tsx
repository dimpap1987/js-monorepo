import { DpNextNavLink } from '@js-monorepo/nav-link'

function NavBar() {
  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <DpNextNavLink href="/">
          <h3 className="text-gray-700">Tranquil Studio</h3>
        </DpNextNavLink>

        <div>
          <ul className="flex space-x-6 text-gray-600">
            <li>
              <DpNextNavLink href="contact">Contact Us</DpNextNavLink>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}

export default NavBar
