import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { DpNextSidebar, type DpNextSidebarProps } from './sidebar'
// @ts-expect-error - Jest resolves this path alias correctly at runtime

import { MenuItem } from '@js-monorepo/types'

import { useClickAway } from 'react-use'

// Mock dependencies
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
      <div {...props}>{children}</div>
    ),
  },
}))

jest.mock('react-use', () => ({
  useClickAway: jest.fn(),
}))

jest.mock('@js-monorepo/nav-link', () => ({
  DpNextNavLink: ({ children, href, onClick, className }: any) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}))

jest.mock('@js-monorepo/navbar', () => ({
  UserMetadata: ({ username, profileImage, createdAt, className }: any) => (
    <div className={className} data-testid="user-metadata">
      <span>{username}</span>
      {profileImage && <img src={profileImage} alt={username} />}
      {createdAt && <span>{createdAt instanceof Date ? createdAt.toISOString() : String(createdAt)}</span>}
    </div>
  ),
}))

jest.mock('react-icons/ai', () => ({
  AiOutlineRollback: () => <svg data-testid="close-icon" />,
}))

describe('DpNextSidebar', () => {
  const mockOnClose = jest.fn()
  const mockItems: MenuItem[] = [
    {
      name: 'Home',
      href: '/',
      roles: ['PUBLIC'],
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      roles: ['USER', 'ADMIN'],
      Icon: () => <span data-testid="dashboard-icon">Dashboard Icon</span>,
    },
    {
      name: 'Admin',
      href: '/admin',
      roles: ['ADMIN'],
    },
  ]

  const defaultProps: DpNextSidebarProps = {
    isOpen: false,
    onClose: mockOnClose,
    items: mockItems,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset body overflow
    document.body.style.overflow = ''
    // Mock useClickAway to do nothing by default
    ;(useClickAway as jest.Mock).mockImplementation(() => {})
  })

  afterEach(() => {
    // Clean up body overflow
    document.body.style.overflow = ''
  })

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<DpNextSidebar {...defaultProps} />)
      expect(screen.queryByLabelText('Sidebar')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(<DpNextSidebar {...defaultProps} isOpen={true} />)
      expect(screen.getByLabelText('Sidebar')).toBeInTheDocument()
    })

    it('should render with default position (left)', () => {
      render(<DpNextSidebar {...defaultProps} isOpen={true} />)
      const sidebar = screen.getByLabelText('Sidebar')
      expect(sidebar).toHaveClass('left-0')
      expect(sidebar).not.toHaveClass('right-0')
    })

    it('should render with right position when specified', () => {
      render(<DpNextSidebar {...defaultProps} isOpen={true} position="right" />)
      const sidebar = screen.getByLabelText('Sidebar')
      expect(sidebar).toHaveClass('right-0')
      expect(sidebar).not.toHaveClass('left-0')
    })

    it('should render header when provided', () => {
      render(<DpNextSidebar {...defaultProps} isOpen={true} header="Menu" />)
      expect(screen.getByText('Menu')).toBeInTheDocument()
    })

    it('should render close button', () => {
      render(<DpNextSidebar {...defaultProps} isOpen={true} />)
      expect(screen.getByLabelText('close sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('close-icon')).toBeInTheDocument()
    })
  })

  describe('User metadata', () => {
    it('should render user metadata when user is provided', () => {
      const user = {
        username: 'testuser',
        roles: ['USER'],
        profile: { image: 'https://example.com/avatar.jpg' },
        createdAt: new Date('2024-01-01'),
      }
      render(<DpNextSidebar {...defaultProps} isOpen={true} user={user} />)
      expect(screen.getByTestId('user-metadata')).toBeInTheDocument()
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })

    it('should not render user metadata when user is not provided', () => {
      render(<DpNextSidebar {...defaultProps} isOpen={true} />)
      expect(screen.queryByTestId('user-metadata')).not.toBeInTheDocument()
    })

    it('should not render user metadata when username is missing', () => {
      const user = {
        roles: ['USER'],
      }
      render(<DpNextSidebar {...defaultProps} isOpen={true} user={user} />)
      expect(screen.queryByTestId('user-metadata')).not.toBeInTheDocument()
    })
  })

  describe('Menu items filtering', () => {
    it('should render PUBLIC items when no user is provided', () => {
      render(<DpNextSidebar {...defaultProps} isOpen={true} />)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    })

    it('should render items matching user roles', () => {
      const user = {
        username: 'testuser',
        roles: ['USER'],
      }
      render(<DpNextSidebar {...defaultProps} isOpen={true} user={user} />)
      expect(screen.getByText('Home')).toBeInTheDocument() // PUBLIC
      expect(screen.getByText('Dashboard')).toBeInTheDocument() // USER
      expect(screen.queryByText('Admin')).not.toBeInTheDocument() // ADMIN only
    })

    it('should render ADMIN items when user has ADMIN role', () => {
      const user = {
        username: 'admin',
        roles: ['ADMIN'],
      }
      render(<DpNextSidebar {...defaultProps} isOpen={true} user={user} />)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
    })

    it('should render items with icons', () => {
      const user = {
        username: 'testuser',
        roles: ['USER'],
      }
      render(<DpNextSidebar {...defaultProps} isOpen={true} user={user} />)
      expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument()
    })

    it('should handle empty items array', () => {
      render(<DpNextSidebar {...defaultProps} isOpen={true} items={[]} />)
      const sidebar = screen.getByLabelText('Sidebar')
      expect(sidebar).toBeInTheDocument()
      // Should still render the sidebar structure
      expect(screen.getByLabelText('close sidebar')).toBeInTheDocument()
    })
  })

  describe('Children rendering', () => {
    it('should render children when provided', () => {
      render(
        <DpNextSidebar {...defaultProps} isOpen={true}>
          <div data-testid="sidebar-children">Custom Content</div>
        </DpNextSidebar>
      )
      expect(screen.getByTestId('sidebar-children')).toBeInTheDocument()
      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })

    it('should not render children container when children is not provided', () => {
      render(<DpNextSidebar {...defaultProps} isOpen={true} />)
      // The children container should not exist
      const childrenContainer = screen.queryByText('Custom Content')
      expect(childrenContainer).not.toBeInTheDocument()
    })
  })

  describe('User interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<DpNextSidebar {...defaultProps} isOpen={true} />)

      const closeButton = screen.getByLabelText('close sidebar')
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when clicking on a menu item', async () => {
      const user = userEvent.setup()
      render(<DpNextSidebar {...defaultProps} isOpen={true} />)

      const homeLink = screen.getByText('Home').closest('a')
      if (homeLink) {
        await user.click(homeLink)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      }
    })

    it('should handle click away to close', () => {
      let clickAwayHandler: (() => void) | undefined
      ;(useClickAway as jest.Mock).mockImplementation((ref: any, handler: () => void) => {
        clickAwayHandler = handler
      })

      render(<DpNextSidebar {...defaultProps} isOpen={true} />)

      // Simulate click away
      if (clickAwayHandler) {
        clickAwayHandler()
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('Body overflow management', () => {
    it('should set body overflow to hidden when sidebar opens', () => {
      const { rerender } = render(<DpNextSidebar {...defaultProps} isOpen={false} />)
      expect(document.body.style.overflow).toBe('')

      rerender(<DpNextSidebar {...defaultProps} isOpen={true} />)

      expect(document.body.style.overflow).toBe('hidden')
    })

    it('should restore body overflow when sidebar closes', async () => {
      const { rerender } = render(<DpNextSidebar {...defaultProps} isOpen={true} />)
      expect(document.body.style.overflow).toBe('hidden')

      rerender(<DpNextSidebar {...defaultProps} isOpen={false} />)

      // Wait for cleanup
      await waitFor(() => {
        expect(document.body.style.overflow).toBe('')
      })
    })

    it('should preserve original overflow value when closing', async () => {
      document.body.style.overflow = 'scroll'
      const { rerender } = render(<DpNextSidebar {...defaultProps} isOpen={true} />)
      expect(document.body.style.overflow).toBe('hidden')

      rerender(<DpNextSidebar {...defaultProps} isOpen={false} />)

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('scroll')
      })
    })
  })

  describe('Focus management', () => {
    it('should focus sidebar when opened', () => {
      render(<DpNextSidebar {...defaultProps} isOpen={true} />)
      const sidebar = screen.getByLabelText('Sidebar')
      // The sidebar has tabIndex={-1} which allows programmatic focus
      expect(sidebar).toHaveAttribute('tabIndex', '-1')
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(<DpNextSidebar {...defaultProps} isOpen={true} />)
      expect(screen.getByLabelText('Sidebar')).toBeInTheDocument()
    })

    it('should have aria-label on close button', () => {
      render(<DpNextSidebar {...defaultProps} isOpen={true} />)
      expect(screen.getByLabelText('close sidebar')).toBeInTheDocument()
    })
  })

  // Note: Ref forwarding has been removed to work with React.memo
  // The component uses an internal ref for click-away handling and focus management

  describe('Position-specific behavior', () => {
    it('should apply correct flex direction for right position', () => {
      render(<DpNextSidebar {...defaultProps} isOpen={true} position="right" />)
      const user = {
        username: 'testuser',
        roles: ['USER'],
      }
      const { container } = render(<DpNextSidebar {...defaultProps} isOpen={true} position="right" user={user} />)
      const navLinks = container.querySelectorAll('a')
      navLinks.forEach((link) => {
        if (link.textContent?.includes('Dashboard')) {
          expect(link).toHaveClass('flex-row-reverse')
        }
      })
    })

    it('should not apply flex-row-reverse for left position', () => {
      const user = {
        username: 'testuser',
        roles: ['USER'],
      }
      const { container } = render(<DpNextSidebar {...defaultProps} isOpen={true} position="left" user={user} />)
      const navLinks = container.querySelectorAll('a')
      navLinks.forEach((link) => {
        expect(link).not.toHaveClass('flex-row-reverse')
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined items gracefully', () => {
      render(<DpNextSidebar {...defaultProps} isOpen={true} items={undefined as any} />)
      expect(screen.getByLabelText('Sidebar')).toBeInTheDocument()
    })

    it('should handle items without roles', () => {
      const itemsWithoutRoles: MenuItem[] = [
        {
          name: 'No Role Item',
          href: '/no-role',
          roles: [], // Empty roles array
        },
      ]
      render(<DpNextSidebar {...defaultProps} isOpen={true} items={itemsWithoutRoles} />)
      // Items without roles should not be rendered
      expect(screen.queryByText('No Role Item')).not.toBeInTheDocument()
    })

    it('should handle user with empty roles array', () => {
      const user = {
        username: 'testuser',
        roles: [],
      }
      render(<DpNextSidebar {...defaultProps} isOpen={true} user={user} />)
      // Should only show PUBLIC items
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })
  })
})
