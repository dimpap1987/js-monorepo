import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { DpNextNavbar, type DpNextNavbarProps, type UserNavProps } from './navbar'
// @ts-expect-error - Jest resolves this path alias correctly at runtime
import { MenuItem } from '@js-monorepo/types'

// Mock dependencies
jest.mock('@js-monorepo/ui/util', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' '),
}))

jest.mock('@js-monorepo/nav-link', () => ({
  DpNextNavLink: ({ children, href, onClick, className }: any) => (
    <a href={href} onClick={onClick} className={className} data-testid={`nav-link-${href}`}>
      {children}
    </a>
  ),
}))

jest.mock('@js-monorepo/button', () => ({
  DpLoginButton: ({ className }: any) => (
    <button className={className} data-testid="login-button">
      Login
    </button>
  ),
  DpLogoutButton: ({ className, onClick }: any) => (
    <button className={className} onClick={onClick} data-testid="logout-button">
      Logout
    </button>
  ),
}))

jest.mock('./components/user-metadata', () => ({
  UserMetadata: ({ username, profileImage, createdAt, className }: any) => (
    <div className={className} data-testid="user-metadata">
      {username && <span data-testid="username">{username}</span>}
      {profileImage && <img src={profileImage} alt={username} data-testid="profile-image" />}
      {createdAt && (
        <span data-testid="created-at">{createdAt instanceof Date ? createdAt.toISOString() : String(createdAt)}</span>
      )}
    </div>
  ),
}))

jest.mock('./components/user-options.component', () => ({
  UserOptionsDropdown: ({ children, className }: any) => (
    <div className={className} data-testid="user-options-dropdown">
      {children}
    </div>
  ),
}))

jest.mock('react-icons/gi', () => ({
  GiHamburgerMenu: () => <svg data-testid="hamburger-icon" />,
}))

jest.mock('react-icons/io', () => ({
  IoIosSettings: () => <svg data-testid="settings-icon" />,
}))

// Helper component to simulate DpLogo
const MockDpLogo = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="dp-logo">{children}</div>
}
MockDpLogo.displayName = 'DpLogo'

// Helper component to simulate NavbarItems
const MockNavbarItems = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="navbar-items">{children}</div>
}
MockNavbarItems.displayName = 'NavbarItems'

describe('DpNextNavbar', () => {
  const mockOnLogout = jest.fn()
  const mockOnSideBarClick = jest.fn()
  const mockMenuItems: MenuItem[] = [
    {
      name: 'Home',
      href: '/',
      roles: ['PUBLIC'],
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      roles: ['USER', 'ADMIN'],
    },
    {
      name: 'Admin',
      href: '/admin',
      roles: ['ADMIN'],
    },
  ]

  const defaultProps: DpNextNavbarProps = {
    menuItems: mockMenuItems,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render navbar with header and nav elements', () => {
      render(<DpNextNavbar {...defaultProps} />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should render without menu items', () => {
      render(<DpNextNavbar />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should render with empty menu items array', () => {
      render(<DpNextNavbar menuItems={[]} />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })

  describe('Logo rendering', () => {
    it('should render logo when DpLogo is provided as child', () => {
      render(
        <DpNextNavbar {...defaultProps}>
          <MockDpLogo>My Logo</MockDpLogo>
        </DpNextNavbar>
      )
      expect(screen.getByTestId('dp-logo')).toBeInTheDocument()
      expect(screen.getByText('My Logo')).toBeInTheDocument()
    })

    it('should not render logo when DpLogo is not provided', () => {
      render(<DpNextNavbar {...defaultProps} />)
      expect(screen.queryByTestId('dp-logo')).not.toBeInTheDocument()
    })

    it('should extract logo from fragment children', () => {
      render(
        <DpNextNavbar {...defaultProps}>
          <React.Fragment>
            <MockDpLogo>Logo in Fragment</MockDpLogo>
          </React.Fragment>
        </DpNextNavbar>
      )
      expect(screen.getByTestId('dp-logo')).toBeInTheDocument()
      expect(screen.getByText('Logo in Fragment')).toBeInTheDocument()
    })
  })

  describe('NavbarItems rendering', () => {
    it('should render NavbarItems when provided as child', () => {
      render(
        <DpNextNavbar {...defaultProps}>
          <MockNavbarItems>Custom Navbar Items</MockNavbarItems>
        </DpNextNavbar>
      )
      expect(screen.getByTestId('navbar-items')).toBeInTheDocument()
      expect(screen.getByText('Custom Navbar Items')).toBeInTheDocument()
    })

    it('should not render NavbarItems when not provided', () => {
      render(<DpNextNavbar {...defaultProps} />)
      expect(screen.queryByTestId('navbar-items')).not.toBeInTheDocument()
    })
  })

  describe('Menu items filtering', () => {
    it('should render PUBLIC items when no user is provided', () => {
      render(<DpNextNavbar {...defaultProps} />)
      expect(screen.getByTestId('nav-link-/')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    })

    it('should render items matching user roles', () => {
      const user: UserNavProps = {
        username: 'testuser',
        roles: ['USER'],
      }
      render(<DpNextNavbar {...defaultProps} user={user} />)
      expect(screen.getByText('Home')).toBeInTheDocument() // PUBLIC
      expect(screen.getByText('Dashboard')).toBeInTheDocument() // USER
      expect(screen.queryByText('Admin')).not.toBeInTheDocument() // ADMIN only
    })

    it('should render ADMIN items when user has ADMIN role', () => {
      const user: UserNavProps = {
        username: 'admin',
        roles: ['ADMIN'],
      }
      render(<DpNextNavbar {...defaultProps} user={user} />)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
    })

    it('should handle items without roles', () => {
      const itemsWithoutRoles: MenuItem[] = [
        {
          name: 'No Role Item',
          href: '/no-role',
          roles: [],
        },
      ]
      render(<DpNextNavbar menuItems={itemsWithoutRoles} />)
      expect(screen.queryByText('No Role Item')).not.toBeInTheDocument()
    })

    it('should apply custom className to menu items', () => {
      const itemsWithClassName: MenuItem[] = [
        {
          name: 'Custom Item',
          href: '/custom',
          roles: ['PUBLIC'],
          className: 'custom-menu-item',
        },
      ]
      const { container } = render(<DpNextNavbar menuItems={itemsWithClassName} />)
      const listItem = container.querySelector('.custom-menu-item')
      expect(listItem).toBeInTheDocument()
    })
  })

  describe('User authentication state', () => {
    it('should show login button when user is not logged in', () => {
      render(<DpNextNavbar {...defaultProps} />)
      expect(screen.getByTestId('login-button')).toBeInTheDocument()
      expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument()
    })

    it('should show user options when user is logged in', () => {
      const user: UserNavProps = {
        username: 'testuser',
        roles: ['USER'],
      }
      render(<DpNextNavbar {...defaultProps} user={user} />)
      expect(screen.getByTestId('user-options-dropdown')).toBeInTheDocument()
      expect(screen.queryByTestId('login-button')).not.toBeInTheDocument()
    })

    it('should show login button when user prop is not provided (defaults to not logged in)', () => {
      render(<DpNextNavbar {...defaultProps} />)
      // When user is undefined, user is not logged in, so login button shows
      expect(screen.getByTestId('login-button')).toBeInTheDocument()
      expect(screen.queryByTestId('user-options-dropdown')).not.toBeInTheDocument()
    })
  })

  describe('User options dropdown', () => {
    it('should render UserMetadata in dropdown when user is logged in', () => {
      const user: UserNavProps = {
        username: 'testuser',
        profile: { image: 'https://example.com/avatar.jpg' },
        createdAt: new Date('2024-01-01'),
      }
      render(<DpNextNavbar {...defaultProps} user={user} />)
      expect(screen.getByTestId('user-metadata')).toBeInTheDocument()
      expect(screen.getByTestId('username')).toHaveTextContent('testuser')
    })

    it('should render settings link in dropdown', () => {
      const user: UserNavProps = {
        username: 'testuser',
      }
      render(<DpNextNavbar {...defaultProps} user={user} />)
      expect(screen.getByTestId('nav-link-/settings')).toBeInTheDocument()
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
    })

    it('should render logout button in dropdown', () => {
      const user: UserNavProps = {
        username: 'testuser',
      }
      render(<DpNextNavbar {...defaultProps} user={user} onLogout={mockOnLogout} />)
      const logoutButton = screen.getByTestId('logout-button')
      expect(logoutButton).toBeInTheDocument()
    })

    it('should call onLogout when logout button is clicked', async () => {
      const user = userEvent.setup()
      const userData: UserNavProps = {
        username: 'testuser',
      }
      render(<DpNextNavbar {...defaultProps} user={userData} onLogout={mockOnLogout} />)
      const logoutButton = screen.getByTestId('logout-button')
      await user.click(logoutButton)
      expect(mockOnLogout).toHaveBeenCalledTimes(1)
    })
  })

  describe('Sidebar toggle button', () => {
    it('should render sidebar toggle button when onSideBarClick is provided', () => {
      render(<DpNextNavbar {...defaultProps} onSideBarClick={mockOnSideBarClick} />)
      expect(screen.getByLabelText('toggle sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('hamburger-icon')).toBeInTheDocument()
    })

    it('should not render sidebar toggle button when onSideBarClick is not provided', () => {
      render(<DpNextNavbar {...defaultProps} />)
      expect(screen.queryByLabelText('toggle sidebar')).not.toBeInTheDocument()
    })

    it('should call onSideBarClick when toggle button is clicked', async () => {
      const user = userEvent.setup()
      render(<DpNextNavbar {...defaultProps} onSideBarClick={mockOnSideBarClick} />)
      const toggleButton = screen.getByLabelText('toggle sidebar')
      await user.click(toggleButton)
      expect(mockOnSideBarClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Ref forwarding', () => {
    it('should forward ref to nav element', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DpNextNavbar {...defaultProps} ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLElement)
      expect(ref.current?.tagName).toBe('NAV')
    })

    it('should handle function ref', () => {
      const refFn = jest.fn()
      render(<DpNextNavbar {...defaultProps} ref={refFn} />)
      expect(refFn).toHaveBeenCalled()
      expect(refFn.mock.calls[0][0]).toBeInstanceOf(HTMLElement)
      expect(refFn.mock.calls[0][0]?.tagName).toBe('NAV')
    })
  })

  describe('Responsive behavior', () => {
    it('should hide menu items on small screens (hidden sm:flex)', () => {
      const { container } = render(<DpNextNavbar {...defaultProps} />)
      const menuList = container.querySelector('.hidden.sm\\:flex')
      expect(menuList).toBeInTheDocument()
    })

    it('should hide sidebar toggle on large screens (block sm:hidden)', () => {
      const { container } = render(<DpNextNavbar {...defaultProps} onSideBarClick={mockOnSideBarClick} />)
      const sidebarIcon = container.querySelector('.block.sm\\:hidden')
      expect(sidebarIcon).toBeInTheDocument()
    })

    it('should hide user options section on small screens (hidden sm:flex)', () => {
      const user: UserNavProps = {
        username: 'testuser',
      }
      const { container } = render(<DpNextNavbar {...defaultProps} user={user} />)
      const userSection = container.querySelector('section.hidden.sm\\:flex')
      expect(userSection).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined menuItems gracefully', () => {
      render(<DpNextNavbar menuItems={undefined as any} />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should handle user with empty roles array', () => {
      const user: UserNavProps = {
        username: 'testuser',
        roles: [],
      }
      render(<DpNextNavbar {...defaultProps} user={user} />)
      // Should only show PUBLIC items
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })

    it('should handle user with partial data', () => {
      const user: UserNavProps = {
        username: 'testuser',
        // No roles, profile, or createdAt
      }
      render(<DpNextNavbar {...defaultProps} user={user} />)
      expect(screen.getByTestId('user-options-dropdown')).toBeInTheDocument()
    })
  })
})
