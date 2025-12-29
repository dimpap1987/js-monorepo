# Booking Platform Specification

## Project Overview

**Platform Type**: Full-stack responsive web application (mobile-first, works on all devices)
**Technology Stack**: Next.js 14 (App Router) + NestJS + Prisma + PostgreSQL + Redis + Socket.IO
**Architecture**: NX Monorepo (existing structure)

---

## Core Concept: Universal Space-Booking Platform

### What This App Does

A **generic, visual booking platform** where:

1. **Venue Owners** (also called: **Locations**, **Spaces**) create (visual floor- optional) plans and manage their bookable spots
2. **Customers** (also called: **Guests**, **Users**) browse venues and make **Reservations** (also called: **Reservations**)
3. The platform supports multiple venue types: restaurants, cafes, coworking spaces, any bookable physical entity

### Key Differentiators

- **Visual Floor Plans**: Interactive canvas-based floor plans (drag-and-drop editor for owners, interactive selection for customers)
- **Real-Time Updates**: WebSocket-powered live availability
- **Generic Architecture**: Not just restaurants - supports any bookable physical entity
- **Self-Service**: Venues create and manage everything themselves

### Terminology Reference

**Primary Terms** (use these in code):

- **Venue** = A physical location that offers bookable spaces (restaurant, cafe, coworking space, etc.)
  - **Alternatives**: Location, Space, Establishment, Place, Business
- **Reservation** = A customer booking of a spot at a venue

**Secondary Terms**:

- **Spot** = A bookable resource within a venue (table, room, seat, zone)
  - **Alternatives**: Table, Resource, Seat, Space, Spot
- **Floor Plan** = Visual representation of a venue's layout with spots
  - **Alternatives**: Layout, Floor Map, Space Map

### Platform Scope

**Supported Venue Types**:

- Restaurants, Cafés, Bars
- Coworking spaces, Lounges
- Event venues, Private rooms
- Hotels (common areas)
- Pop-ups / temporary venues

**Each Venue Defines**:

- **Space types** (tables, rooms, seats, zones)
- **Capacity** & rules
- **Time slots** & availability
- **Booking rules** (optional - cafes can disable reservations entirely)

---

## Application Type & Platform

**Platform**: **Responsive Web Application** (not native mobile app initially)

- Full responsive design (mobile, tablet, desktop)
- Progressive Web App (PWA) capabilities
- Works in all modern browsers
- Mobile-first design approach
- Can be installed on mobile devices (PWA)

**Future Consideration**: Native mobile apps (iOS/Android) can be added in Phase 2+

---

## Role Architecture & Access Control

### Core Roles

The platform operates with **three distinct roles**, each with specific permissions:

#### 1. **Platform Admin** (`ADMIN` role)

- **Scope**: Platform-wide management
- **Capabilities**:
  - Manage all venues (view, moderate, suspend)
  - Manage users (view, suspend, assign roles)
  - Platform settings & configuration
  - System-wide analytics
  - Content moderation
  - Access to all data (read-only for auditing)

#### 2. **Customer** (`USER` role)

- **Scope**: Individual booking consumer
- **Capabilities**:
  - Browse & search venues (public data)
  - View venue floor plans (read-only)
  - **Create bookings at any venue** (including own venues if they're also owners)
  - Manage own bookings (view, modify, cancel)
  - View booking history
  - Set preferences & favorites
  - Cannot create or manage venues (unless they also own them)

#### 3. **Venue Owner/Manager** (`USER` role + Venue Ownership)

- **Scope**: Venue-specific management
- **Capabilities**:
  - Create & manage owned venues (CRUD)
  - Manage floor plans & spots for owned venues
  - **Create bookings at any venue** (including their own venues - useful for VIP reservations, walk-ins, staff bookings)
  - View & manage **all bookings** for owned venues (not just own bookings)
  - Configure venue settings & rules
  - Access venue analytics dashboard
  - Can also be a customer (book at other venues)

### Architectural Decision: Role vs Ownership Model

**Design Choice**: **Hybrid Model (Role + Ownership)**

```
Base Roles (RBAC):
  - ADMIN: Platform admin
  - USER: Standard user (can be customer OR venue owner)

Ownership Model (Relationship-Based):
  - Users can own/manage venues (many-to-many)
  - Access control: Check BOTH role AND ownership
```

**Benefits**:

- ✅ **Flexible**: User can be both customer and venue owner
- ✅ **Extensible**: Easy to add staff roles per venue later
- ✅ **Secure**: Ownership verified at data level, not just role
- ✅ **Multi-tenancy**: Clear data isolation between venues

**Implementation**:

```typescript
// Access Control Logic
- ADMIN: Can access everything
- USER + owns venue: Can manage that venue + create bookings anywhere
- USER only: Can create bookings anywhere, but only manage own bookings
```

**Key Design Decision**: **All authenticated users can create bookings**

- ✅ **More Flexible**: Venue owners can book their own tables (VIP reservations, walk-ins, internal use)
- ✅ **Real-world Usage**: Staff need to create manual bookings, record walk-ins
- ✅ **Simpler Permissions**: One less edge case to handle
- ✅ **Better UX**: No need to switch between "customer mode" and "owner mode" to book

**What's Restricted**:

- **View/Manage Permissions**: Users can only view/manage bookings they created OR bookings for venues they own
- **Venue Management**: Only venue owners/admins can manage venue settings

**Data Model**:

```
AuthUser (existing)
  ├── roles: Role[] (ADMIN, USER)
  └── ownedVenues: VenueOwner[] (many-to-many)

VenueOwner (junction table)
  ├── userId: FK -> AuthUser
  ├── venueId: FK -> Venue
  ├── role: 'OWNER' | 'MANAGER' | 'STAFF' (future)
  └── permissions: JSON (granular per-venue permissions)
```

### Access Control Guards

**New Guards to Implement**:

- `VenueOwnerGuard`: Ensures user owns/manages the venue
- `VenueAccessGuard`: Combines role + ownership check
- `VenueOrAdminGuard`: Allows ADMIN or venue owner

**Permissions Matrix**:

| Action                | Customer | Venue Owner                        | Admin |
| --------------------- | -------- | ---------------------------------- | ----- |
| Browse venues         | ✅       | ✅                                 | ✅    |
| Create booking        | ✅       | ✅ (any venue, including own)      | ✅    |
| Create venue          | ❌       | ✅                                 | ✅    |
| Edit own venue        | ❌       | ✅                                 | ✅    |
| Edit any venue        | ❌       | ❌                                 | ✅    |
| View own bookings     | ✅       | ✅                                 | ✅    |
| View venue bookings   | ❌       | ✅ (all bookings for owned venues) | ✅    |
| Manage own bookings   | ✅       | ✅                                 | ✅    |
| Manage venue bookings | ❌       | ✅ (all bookings for owned venues) | ✅    |
| Manage spots          | ❌       | ✅ (own venues)                    | ✅    |

**Booking Creation Notes**:

- **Any authenticated user** can create a booking at any venue
- Venue owners creating bookings at their own venues is useful for:
  - VIP reservations
  - Walk-in customers (record in system)
  - Staff/internal reservations
  - Blocking tables for maintenance/events
- The booking will show who created it (customer vs venue owner/staff)

---

## Core Features (MVP / Basics)

### 1. Visual Floor-Plan Booking (Key Differentiator)

**Canvas-Based Floor Plan System**

Each venue has one or more **floors**, each with its own **canvas-based visual representation**:

- **Canvas Editor** (for venue owners):

  - HTML5 Canvas or SVG-based editor
  - Drag & drop interface to create/edit floor plans
  - Draw background (floor plan image or shapes)
  - Place spot objects (tables, seats, rooms) on canvas
  - Each spot is a visual object with:
    - Position (x, y coordinates on canvas)
    - Dimensions (width, height)
    - Shape type (circle, rectangle, polygon, custom)
    - Rotation angle (optional)
    - Z-index (layering)

- **Spot Objects** (tables/spaces):

  - Visual representation on canvas
  - Properties:
    - Capacity (min/max guests)
    - Shape (round, square, long, custom polygon)
    - Location metadata (floor, section, area)
    - Mergeable with adjacent spots
    - Visual attributes (color, icon, label)
    - Metadata: view direction, noise level, amenities

- **Canvas Data Storage**:

  - Store as JSON (vector data, not raster)
  - Structure:
    ```json
    {
      "floors": [
        {
          "id": "floor-1",
          "name": "Ground Floor",
          "background": { "imageUrl": "...", "width": 1200, "height": 800 },
          "spots": [
            {
              "id": "table-1",
              "type": "table",
              "position": { "x": 100, "y": 200 },
              "shape": { "type": "circle", "radius": 30 },
              "capacity": { "min": 2, "max": 4 },
              "metadata": { "view": "window", "noise": "low" }
            }
          ]
        }
      ]
    }
    ```

- **Customer View**:

  - Interactive floor plan (read-only)
  - **Color-coded availability** (green/yellow/red)
  - **Real-time updates** via WebSockets
  - Click spot → see details:
    - Photos from that spot (optional)
    - View direction (window, bar, quiet zone)
    - Noise level indicator
    - Minimum spend (optional)
    - Capacity
    - Availability status

- **Technical Implementation**:
  - Frontend: Canvas API (fabric.js, konva.js, or custom)
  - Backend: Store canvas JSON in database
  - Real-time: WebSocket updates for availability changes
  - Responsive: Canvas scales for different screen sizes

### 2. Booking Engine

- **Resource-based model** (generic - supports tables, rooms, seats, zones)
- Time-slot availability
- Booking CRUD (create, view, modify, cancel)
- Conflict resolution & race condition handling
- Soft vs hard reservations
- Auto-release for no-shows
  - via emails, viber, the app it self

### 3. Venue Owner Features

- Create/edit venue profile
- Enable/disable booking (optional)
- Floor-plan editor
- Spot management (create, edit, disable spots)
- Set availability rules:
  - Operating hours
  - Booking lead time
  - Duration per booking (optional)
  - Buffer time between bookings
  - Blackout dates/times
- View/manage reservations (calendar + list)
- Accept/reject bookings (if manual approval)

### 4. Customer Features

- Browse/search venues (location-based)
- Visual floor-plan selection
- Check real-time availability
- Make/modify/cancel bookings
- Booking history
- Notifications (confirmations, reminders)

### 5. Smart Filtering (Basic)

- Location-based search
- Filters: capacity, amenities, accessibility
- Time-slot availability check
- Smart matching suggestions:
  - "Best table for a date"
  - "Quiet place to work"
  - "Wheelchair accessible"
  - "Group of 6, birthday"

---

## UI/UX Design: Speed & Simplicity First

### Design Principles

**Core Values**:

1. **Speed**: Booking should take < 60 seconds from search to confirmation
2. **Simplicity**: Minimal clicks, clear actions, no cognitive load
3. **Visual**: See before you book (floor plans, photos, real-time status)
4. **Mobile-First**: 80%+ users on mobile - optimize for thumb navigation
5. **Progressive Disclosure**: Show essentials first, details on demand
6. **Responsive**: Must work perfectly on all screen sizes (320px to 4K)

### User Interface Concepts

#### **1. Customer Booking Flow (Mobile-First)**

**Search Screen** (Landing/Home)

```
┌─────────────────────────────┐
│  [📍 Location Search]       │  ← Quick search bar
│  🔍 "Restaurant near me"    │
├─────────────────────────────┤
│  📅 Today, 8:00 PM    [▼]   │  ← Smart defaults
│  👥 2 guests          [▼]   │
├─────────────────────────────┤
│  🗺️ Map View | 📋 List      │  ← Toggle views
├─────────────────────────────┤
│  [Venue Card]               │
│  ┌─────────────────┐        │
│  │  [Photo]        │        │
│  │                 │        │
│  └─────────────────┘        │
│  🏛️ Venue Name              │
│  ⭐ 4.8 (234)  •  🍽️ $$$    │
│  📍 0.5 km away             │
│  ✅ Available now            │  ← Real-time status
│  [Book Table] ──────────▶   │  ← Single tap CTA
├─────────────────────────────┤
│  [Next Venue Card...]       │
└─────────────────────────────┘
```

**Venue Detail Screen**

```
┌─────────────────────────────┐
│  [← Back]    [❤️ Save]      │
├─────────────────────────────┤
│  [Hero Photo Gallery]       │  ← Swipeable
│         ⚫⚪⚪⚪              │
├─────────────────────────────┤
│  🏛️ Venue Name              │
│  ⭐ 4.8 (234)  •  🍽️ $$$    │
│  📍 Address                 │
│  🕐 Open until 11 PM        │
├─────────────────────────────┤
│  ┌─────────────────────┐    │
│  │  📅 Today, 8:00 PM  │    │  ← Quick book bar
│  │  👥 2 guests        │    │
│  │  [Find Tables] ───▶ │    │
│  └─────────────────────┘    │
├─────────────────────────────┤
│  🗺️ Floor Plan              │  ← Visual booking
│  ┌─────────────────────┐    │
│  │   [Canvas View]     │    │
│  │   🟢🟢🟡🟢          │    │  ← Color-coded spots
│  │   🟢🟡🔴🟢          │    │
│  └─────────────────────┘    │
│  🟢 Available  🟡 Few left  │
│  🔴 Booked                   │
│  [Select Table] ────────▶   │
├─────────────────────────────┤
│  ℹ️ About | 📸 Photos        │  ← Details below
│  📝 Reviews | 📍 Location    │
└─────────────────────────────┘
```

**Floor Plan Selection** (Key Differentiator)

```
┌─────────────────────────────┐
│  [← Back]  Select Table     │
├─────────────────────────────┤
│  📅 Today, 8:00 PM          │
│  👥 2 guests                │
├─────────────────────────────┤
│  ┌─────────────────────┐    │
│  │                     │    │
│  │    🟢 Table 5       │    │  ← Interactive canvas
│  │      (2-4 seats)    │    │     Tap to select
│  │                     │    │
│  │  🟡 Table 3  🔴 T2  │    │
│  │                     │    │
│  │    🟢 Table 7       │    │
│  │      (Window view)  │    │
│  └─────────────────────┘    │
├─────────────────────────────┤
│  Selected: Table 5          │  ← Bottom sheet
│  ┌─────────────────────┐    │
│  │ 📍 Window view      │    │
│  │ 🔇 Quiet zone       │    │
│  │ 👥 2-4 seats        │    │
│  │                     │    │
│  │ [Book Table 5] ───▶ │    │  ← One tap
│  └─────────────────────┘    │
└─────────────────────────────┘
```

**Quick Booking (If table not needed)**

```
┌─────────────────────────────┐
│  Quick Book                 │
│  ┌─────────────────────┐    │
│  │ 📅 Today            │    │
│  │ 🕐 8:00 PM  [▼]     │    │  ← Smart suggestions
│  │ 👥 2 guests  [▼]    │    │
│  │                     │    │
│  │ 💺 Any available    │    │  ← Auto-assign option
│  │    table            │    │
│  │                     │    │
│  │ [Confirm Booking]──▶│    │  ← Single action
│  └─────────────────────┘    │
└─────────────────────────────┘
```

**Confirmation Screen**

```
┌─────────────────────────────┐
│         ✅                  │
│    Booking Confirmed!       │
├─────────────────────────────┤
│  📅 Today, January 15       │
│  🕐 8:00 PM                 │
│  👥 2 guests                │
│  💺 Table 5                 │
├─────────────────────────────┤
│  🏛️ Venue Name              │
│  📍 Address                 │
├─────────────────────────────┤
│  📧 Confirmation sent       │
│  🔔 Reminder at 7 PM        │
├─────────────────────────────┤
│  [View Details]             │
│  [Add to Calendar]          │
│  [Share]                    │
└─────────────────────────────┘
```

**My Bookings Screen**

```
┌─────────────────────────────┐
│  My Bookings                │
├─────────────────────────────┤
│  🔵 Upcoming                │
│  ┌─────────────────────┐    │
│  │ 📅 Today, 8:00 PM   │    │
│  │ 🏛️ Venue Name       │    │
│  │ 💺 Table 5          │    │
│  │ [Modify] [Cancel]   │    │
│  └─────────────────────┘    │
├─────────────────────────────┤
│  ⚫ Past                    │
│  [Previous bookings...]     │
└─────────────────────────────┘
```

#### **2. Venue Owner Dashboard (Desktop/Tablet)**

**Dashboard Overview**

```
┌─────────────────────────────────────────────────────┐
│  Dashboard  |  Reservations  |  Floor Plans  | ... │
├─────────────────────────────────────────────────────┤
│  Today, Jan 15                    📅 [▼]           │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 📊 12    │ │ ✅ 8     │ │ ⏰ 4      │           │
│  │ Bookings │ │ Confirmed│ │ Pending  │           │
│  └──────────┘ └──────────┘ └──────────┘           │
├─────────────────────────────────────────────────────┤
│  📅 Today's Timeline                               │
│  ┌──────────────────────────────────────────────┐  │
│  │ 6 PM   7 PM   8 PM   9 PM   10 PM           │  │
│  │ |──────|──────|──────|──────|               │  │
│  │        🟢T5   🟡T3   🔴T2                   │  │
│  │        ✅     ⏰     ✅                      │  │
│  └──────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  🗺️ Live Floor Plan                                │
│  ┌──────────────────────────────────────────────┐  │
│  │  [Interactive Canvas]                        │  │
│  │  Real-time table status                      │  │
│  │  Click to see details                        │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Floor Plan Editor**

```
┌─────────────────────────────────────────────────────┐
│  Edit Floor Plan  [Save] [Cancel]                  │
├─────────────────────────────────────────────────────┤
│  [Toolbar]                                         │
│  ➕ Add Table  📐 Draw  🖼️ Upload BG  🔄 Rotate    │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  │  [Canvas - Drag & Drop Interface]           │  │
│  │                                              │  │
│  │    [Table 5]    [Table 3]                   │  │
│  │                                              │  │
│  │    [Table 7]                                │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  Selected: Table 5                                 │
│  ┌──────────────────────────────────────────────┐  │
│  │ Name: [Table 5]                             │  │
│  │ Capacity: [2] - [4] guests                  │  │
│  │ Shape: [Circle ▼]                           │  │
│  │ View: [Window ▼]                            │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### **3. Key UI Patterns**

**Bottom Sheet Pattern** (Mobile)

- Use for details, actions, forms
- Swipe down to dismiss
- Keeps context visible
- Fast access to actions

**Progressive Enhancement**

- Show essentials first
- Load details on scroll/tap
- Lazy load images
- Skeleton screens during load

**Smart Defaults**

- Auto-fill location (GPS)
- Remember party size
- Suggest popular times
- Pre-filter by availability

**One-Tap Actions**

- "Book Now" buttons prominent
- Quick actions (modify, cancel)
- Swipe gestures for common actions
- Floating action buttons (FAB)

**Visual Feedback**

- Loading states (skeletons, spinners)
- Success animations (checkmarks)
- Error states (clear, actionable)
- Haptic feedback (mobile)

### Performance Targets

**Speed Metrics**:

- ⚡ Initial load: < 2 seconds (3G)
- ⚡ Search results: < 500ms
- ⚡ Floor plan render: < 1 second
- ⚡ Booking submission: < 2 seconds
- ⚡ Real-time updates: < 100ms latency

**Optimization Strategies**:

- Image optimization (WebP, lazy loading)
- Code splitting (route-based)
- Service worker (offline support)
- Redis caching (availability data)
- WebSocket pooling (reduce connections)
- Virtual scrolling (long lists)

### User Flows

#### **Flow 1: Quick Booking (Fastest Path)**

```
1. Open app → See nearby venues (GPS)
2. Tap venue → See availability
3. Tap "Quick Book" → Confirm date/time
4. Tap "Confirm" → Done (60 seconds)
```

#### **Flow 2: Visual Table Selection**

```
1. Search venue → View details
2. Tap "View Floor Plan" → Interactive canvas
3. Tap desired table → See details
4. Tap "Book This Table" → Confirm
5. Done
```

#### **Flow 3: Venue Owner - Create Floor Plan**

```
1. Dashboard → "Floor Plans" → "Create New"
2. Upload floor plan image (optional)
3. Drag & drop tables onto canvas
4. Click table → Edit properties (capacity, name)
5. Save → Ready to accept bookings
```

### Mobile-First Considerations

**Thumb Zone Optimization**:

- Primary actions in bottom 1/3 of screen
- Navigation at bottom (not top)
- Large touch targets (min 44px)
- Swipe gestures for navigation

**Responsive Breakpoints**:

- Mobile: 320px - 768px (primary)
- Tablet: 768px - 1024px
- Desktop: 1024px+ (venue owner tools)

**Progressive Web App (PWA)**:

- Install prompt
- Offline mode (view bookings)
- Push notifications
- App-like experience

---

## Technical Architecture

### Core Architecture Principles

**Design Goals**: Extensibility, Reusability, Multi-tenancy, Type Safety

#### 1. **Generic Resource Model** (Foundation)

The system is built on a generic "Resource" abstraction that can represent any bookable entity:

```
Resource (Abstract/Interface)
  ├── Core Properties
  │   ├── id, type (table/room/seat/zone/equipment/etc.)
  │   ├── capacity (min/max)
  │   └── venueId (belongs to venue)
  │
  ├── Availability Rules (Strategy Pattern)
  │   ├── Operating hours
  │   ├── Blackout dates/times
  │   ├── Lead time rules
  │   └── Duration constraints
  │
  ├── Pricing Rules (Strategy Pattern)
  │   ├── Base price
  │   ├── Dynamic pricing (time-based, demand-based)
  │   └── Fees/deposits
  │
  └── Metadata (Extensible JSON)
      ├── Canvas position & shape
      ├── Amenities
      └── Custom attributes
```

**Why Generic?**:

- ✅ Future-proof: Can add gym classes, studio rentals, parking, etc.
- ✅ Reusable logic: Availability checking works for any resource type
- ✅ Type-safe extensions: TypeScript interfaces ensure consistency

#### 2. **Multi-Tenancy & Data Isolation**

- **Tenant**: Each `Venue` is a tenant
- **Isolation**: Data scoped by `venueId` (soft isolation)
- **Security**: Ownership verification at service layer
- **Scalability**: Can add hard isolation (separate databases) later

#### 3. **Event-Driven Architecture**

- Booking events trigger notifications, analytics, webhooks
- WebSocket events for real-time updates
- Pluggable event handlers (extendable)

#### 4. **Repository Pattern**

- Interface-based repositories (easy to swap implementations)
- Prisma implementation
- Allows future: MongoDB, Redis, etc.

#### 5. **Strategy Pattern for Rules**

- Availability rules (time-based, capacity-based, custom)
- Pricing rules (fixed, dynamic, tiered)
- Cancellation policies
- All pluggable & configurable per venue/resource

### Core Data Model (Generic Resource-Based)

**Note**: Use "Venue" and "Reservation" as primary terms in code, but support alternative terminology in UI/API.

```prisma
// Core Entities

Venue (also: Location, Space, Establishment)
  - id, name, description
  - location (address, lat/lng, timezone)
  - contact info, photos
  - settings:
    - bookingEnabled: boolean
    - autoConfirm: boolean
    - cancellationPolicy: JSON
    - operatingHours: JSON
  - canvasData: JSON (floor plan data)
  - subscriptionTier: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  - subscriptionStatus: 'active' | 'trial' | 'cancelled' | 'expired'
  - bookingCountThisMonth: Int (for free tier limits)
  - lastBookingCountReset: DateTime
  - ownerId: FK -> AuthUser (via VenueOwner)

VenueOwner (Junction Table)
  - userId: FK -> AuthUser
  - venueId: FK -> Venue
  - role: 'OWNER' | 'MANAGER' | 'STAFF'
  - permissions: JSON
  - createdAt, updatedAt

Floor (also: Level, Floor Plan)
  - id, venueId, name, level
  - canvasData: JSON (background, dimensions)
  - order: number (display order)

Spot (also: Table, Resource, Seat, Space)
  - id, venueId, floorId
  - name, type (table/room/seat/zone)
  - capacityMin, capacityMax
  - canvasData: JSON (position, shape, visual props)
  - availabilityRules: JSON
  - pricingRules: JSON (optional)
  - metadata: JSON (amenities, view, noise, etc.)
  - isActive: boolean
  - canMerge: boolean
  - mergedWithIds: Int[] (for grouped spots)

Reservation (also: Booking, Appointment)
  - id, venueId
  - spotIds: Int[] (can book multiple spots)
  - customerId: FK -> AuthUser (the guest/customer for this booking)
  - createdById: FK -> AuthUser (who created the booking - could be customer or venue owner/staff)
  - date, startTime, endTime
  - guestCount
  - status: pending | confirmed | checked_in | completed | cancelled | no_show
  - specialRequests: string
  - cancellationReason: string
  - bookingSource: string ('self-service' | 'staff' | 'walk-in' | 'phone' | 'api')
  - paymentInfo: JSON (if paid)
  - remindersSent: JSON (track reminder notifications)
  - createdAt, updatedAt, cancelledAt

AvailabilitySlot (Alternative: Rule-Based)
  - id, spotId
  - date, startTime, endTime
  - status: available | booked | blocked | maintenance
  - reservationId: FK -> Reservation (nullable)

Waitlist (Phase 2)
  - id, venueId, customerId
  - requestedDate, requestedTime, guestCount
  - status, position, notifiedAt

Subscription (for pricing tiers)
  - id, venueId: FK -> Venue
  - tier: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  - status: 'active' | 'trial' | 'cancelled' | 'expired'
  - billingCycle: 'monthly' | 'yearly'
  - price: Decimal
  - nextBillingDate: DateTime
  - cancelledAt: DateTime
  - createdAt, updatedAt
```

### Extension Points (Future-Proof Design)

**1. Resource Types**

```typescript
// Easy to extend without changing core
interface Resource {
  type: 'table' | 'room' | 'seat' | 'zone' | 'gym_class' | 'parking' | ...
  // Common interface, type-specific metadata in JSON
}
```

**2. Availability Strategies**

```typescript
interface AvailabilityStrategy {
  checkAvailability(resource: Resource, date: Date, time: Time): boolean
}
// Implementations: TimeBased, CapacityBased, CustomRuleBased
```

**3. Pricing Strategies**

```typescript
interface PricingStrategy {
  calculatePrice(resource: Resource, date: Date, time: Time): number
}
// Implementations: FixedPrice, DynamicPricing, TieredPricing
```

**4. Notification Channels**

```typescript
// Existing system + extensible
// Email, Push, SMS, Viber (via webhooks/integrations)
```

**5. Payment Providers**

```typescript
// Existing Stripe + extensible
// Can add: PayPal, Square, Venmo, etc.
```

### Stack Integration (Use Existing)

- ✅ **Auth**: Session-based, OAuth (Google, GitHub)
- ✅ **WebSockets**: Real-time availability updates
- ✅ **Notifications**: In-app, email, push (existing system)
- ✅ **Payments**: Stripe integration (if charging)
- ✅ **Redis**: Caching, sessions
- ✅ **Prisma**: Database ORM

### Module Structure (NX Monorepo)

Following existing patterns in the codebase:

```
libs/
  ├── bookings/
  │   ├── server/                          # NestJS backend
  │   │   ├── src/
  │   │   │   ├── venues/
  │   │   │   │   ├── venues.module.ts
  │   │   │   │   ├── venues.service.ts
  │   │   │   │   ├── venues.controller.ts
  │   │   │   │   ├── dto/
  │   │   │   │   └── guards/
  │   │   │   │       └── venue-owner.guard.ts
  │   │   │   ├── spots/
  │   │   │   │   ├── spots.module.ts
  │   │   │   │   ├── spots.service.ts
  │   │   │   │   └── spots.controller.ts
  │   │   │   ├── reservations/
  │   │   │   │   ├── reservations.module.ts
  │   │   │   │   ├── reservations.service.ts
  │   │   │   │   ├── reservations.controller.ts
  │   │   │   │   └── strategies/          # Availability, pricing strategies
  │   │   │   ├── floor-plans/
  │   │   │   │   ├── floor-plans.module.ts
  │   │   │   │   └── floor-plans.service.ts
  │   │   │   └── bookings.module.ts       # Root module
  │   │   └── project.json
  │   │
  │   └── client/                          # React/Next.js frontend
  │       ├── src/
  │       │   ├── components/
  │       │   │   ├── floor-plan-editor/   # Canvas-based editor
  │       │   │   ├── floor-plan-viewer/   # Customer view
  │       │   │   ├── booking-form/
  │       │   │   └── venue-card/
  │       │   ├── hooks/
  │       │   │   ├── useVenues.ts
  │       │   │   ├── useBookings.ts
  │       │   │   └── useFloorPlan.ts
  │       │   └── providers/
  │       │       └── bookings.provider.tsx
  │       └── project.json
  │
  └── prisma/
      └── db/
          └── src/
              └── lib/
                  └── prisma/
                      └── schema/
                          └── bookings.prisma   # New schema file
```

**Integration Points**:

- Extend `RolesEnum` in `libs/auth/nest/src/common/types/index.ts`
- Use existing guards: `LoggedInGuard`, extend with `VenueOwnerGuard`
- Use existing WebSocket infrastructure (`libs/websockets/user-presence`)
- Use existing notification system (`libs/notifications/server`)
- Use existing payment system (`libs/payments/server`) - optional

### Database Schema

**New Prisma Schema**: `libs/prisma/db/src/lib/prisma/schema/bookings.prisma`

Key relationships:

- `Venue` ↔ `AuthUser` (via `VenueOwner` many-to-many)
- `Venue` → `Floor` (one-to-many)
- `Floor` → `Spot` (one-to-many)
- `Spot` → `Reservation` (one-to-many, via junction)
- `AuthUser` → `Reservation` (one-to-many, as customer)

### Critical Technical Challenges

#### 1. **Race Conditions on Booking**

- **Problem**: Multiple users booking same spot simultaneously
- **Solution**: Optimistic locking with Redis distributed locks
- **Implementation**:
  - Lock spot for booking duration (e.g., 5 minutes)
  - Use Redis `SETNX` with expiration
  - Transactional booking creation in database
  - Rollback on failure

#### 2. **Canvas Data Management**

- **Problem**: Complex floor plan data, versioning, performance
- **Solution**:
  - Store as JSON (PostgreSQL JSONB for querying)
  - Version control for floor plan changes (optional)
  - Lazy load canvas data (only when viewing floor plan)
  - Cache rendered floor plans in Redis

#### 3. **Table Merging Logic**

- **Problem**: Combining adjacent spots for large parties
- **Solution**:
  - Store `mergedWithIds` array in Spot model
  - Availability check considers merged spots
  - Booking multiple spots atomically (transaction)

#### 4. **Time Overlap Validation**

- **Problem**: Prevent double-booking, handle buffers
- **Solution**:
  - Database constraints + application-level validation
  - Query existing reservations in time range
  - Check buffer times before/after bookings
  - Consider timezone (store all times in venue timezone, convert for display)

#### 5. **Availability Caching**

- **Problem**: Real-time availability with high query load
- **Solution**:
  - Cache availability slots in Redis (key: `venue:${venueId}:spot:${spotId}:date`)
  - Invalidate on booking create/update/cancel
  - WebSocket push updates to connected clients
  - Fallback to database if cache miss

#### 6. **Multi-Tenancy Data Isolation**

- **Problem**: Ensure venue owners only see their data
- **Solution**:
  - Ownership verification in service layer (not just UI)
  - Database query scoping (always filter by `venueId`)
  - Guard decorators enforce access control
  - Audit logs for admin access

#### 7. **Canvas Rendering Performance**

- **Problem**: Large floor plans, many spots, real-time updates
- **Solution**:
  - Virtual scrolling for large canvases
  - Render only visible spots
  - Debounce real-time updates
  - Use Web Workers for complex calculations
  - Optimize canvas rendering (requestAnimationFrame)

---

## Pricing & Freemium Model

### Recommended Approach: **Usage-Based Free Tier + Feature Tiers**

Instead of "first month free only", use a **permanent free tier with usage limits** + premium features. This is more sustainable and user-friendly.

### Pricing Tiers

#### **FREE Tier** (Forever Free - No Credit Card Required)

**Purpose**: Low-friction onboarding, perfect for small venues/testing

**Limits**:

- ✅ **1 venue** per account
- ✅ **50 bookings per month** (free)
- ✅ **Basic floor plan editor** (up to 10 spots/tables)
- ✅ **Core booking features** (create, view, manage bookings)
- ✅ **Email notifications** (unlimited)
- ✅ **Basic analytics** (daily/weekly booking counts)
- ✅ **Real-time availability** (WebSocket updates)
- ❌ No advanced features (waitlist, recurring bookings, etc.)
- ❌ No white-label/branding removal
- ❌ No API access
- ❌ Limited support (community/email only)

**Best For**:

- Small cafes, pop-ups
- Testing the platform
- Seasonal venues
- Side businesses

#### **STARTER Tier** (€29/month or €290/year)

**Purpose**: Growing venues, remove booking limits

**Includes Free Tier +**:

- ✅ **Unlimited bookings** per month
- ✅ **Up to 3 venues** per account
- ✅ **Unlimited spots/tables** per floor plan
- ✅ **Advanced floor plan features** (custom shapes, merge tables)
- ✅ **Waitlist management**
- ✅ **Booking reminders** (SMS/Push notifications)
- ✅ **Basic analytics dashboard** (revenue, occupancy, trends)
- ✅ **Customer management** (guest database)
- ✅ **Email support** (48h response)

**Best For**:

- Small-medium restaurants
- Multiple locations
- Growing businesses

#### **PROFESSIONAL Tier** (€79/month or €790/year)

**Purpose**: Full-featured for serious venues

**Includes Starter +**:

- ✅ **Unlimited venues**
- ✅ **Advanced analytics** (heatmaps, revenue per table, forecasting)
- ✅ **Recurring bookings**
- ✅ **Dynamic pricing rules**
- ✅ **Multi-language support**
- ✅ **API access** (integrations)
- ✅ **Custom branding** (remove platform branding)
- ✅ **Priority support** (24h response, chat)
- ✅ **Advanced notifications** (multi-channel: SMS, Viber, WhatsApp)
- ✅ **Staff accounts** (up to 5 staff members)
- ✅ **QR code check-in**

**Best For**:

- Established restaurants
- High-volume venues
- Multi-location chains
- Professional operations

#### **ENTERPRISE Tier** (Custom Pricing)

**Purpose**: Large operations, white-label, custom needs

**Includes Professional +**:

- ✅ **White-label solution** (full branding customization)
- ✅ **Dedicated account manager**
- ✅ **Custom integrations** (POS systems, payment processors)
- ✅ **Unlimited staff accounts**
- ✅ **Advanced security** (SSO, custom auth)
- ✅ **SLA guarantees** (uptime, support)
- ✅ **Custom development** (feature requests)
- ✅ **Training & onboarding**

**Best For**:

- Hotel chains
- Restaurant groups
- Enterprise clients

### Alternative: Pay-Per-Booking Model

**Option B: Commission-Based** (Alternative to subscription)

- **Free tier**: 2% commission per booking
- **Volume discount**:
  - 100+ bookings/month: 1.5%
  - 500+ bookings/month: 1%
  - 1000+ bookings/month: 0.5%

**Pros**: Lower barrier to entry, scales with revenue
**Cons**: Less predictable revenue, need payment processing

### Hybrid Model (Recommended)

**Free Tier**: Usage limits (50 bookings/month)

- Lowers barrier to entry
- Allows testing
- Reduces abuse

**Paid Tiers**: Feature-based + remove limits

- Clear value proposition
- Predictable revenue
- Scales with venue growth

**Optional Add-ons** (Available in all paid tiers):

- SMS notifications: €0.05 per SMS
- Advanced analytics add-on: €15/month
- Additional staff accounts: €5/month per user

### Implementation Strategy

#### **Phase 1: Launch (Months 1-3)**

- **FREE tier only** (unlimited during beta)
- Gather feedback, build user base
- Identify most-used features
- Validate product-market fit

#### **Phase 2: Monetization (Month 4+)**

- Introduce paid tiers
- Grandfather early adopters (free for 6-12 months)
- Offer migration discounts
- Monitor conversion rates

#### **Conversion Tactics**

1. **Soft limits**: Show "50/50 bookings used" (not hard stop)
2. **Upgrade prompts**: Contextual, not annoying
3. **Feature gates**: "Upgrade to unlock waitlist" with clear value
4. **Usage insights**: "You saved 10 hours this month with automation"
5. **Trial periods**: 14-day free trial of Professional tier

### Data Model for Tiers

```prisma
Venue
  - subscriptionTier: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  - subscriptionStatus: 'active' | 'trial' | 'cancelled' | 'expired'
  - subscriptionStartDate: DateTime
  - subscriptionEndDate: DateTime
  - bookingCountThisMonth: Int (track for limits)
  - lastBookingCountReset: DateTime

Subscription
  - venueId: FK -> Venue
  - tier: enum
  - status: enum
  - billingCycle: 'monthly' | 'yearly'
  - price: Decimal
  - nextBillingDate: DateTime
  - cancelledAt: DateTime
```

### Feature Gating Logic

```typescript
// Service-level feature checks
class VenueService {
  async canCreateBooking(venueId: number): Promise<boolean> {
    const venue = await this.getVenue(venueId)
    if (venue.subscriptionTier === 'FREE') {
      const bookingCount = await this.getBookingCountThisMonth(venueId)
      return bookingCount < 50 // Free tier limit
    }
    return true // Paid tiers unlimited
  }

  async canAccessFeature(venueId: number, feature: string): Promise<boolean> {
    const venue = await this.getVenue(venueId)
    const featureMap = {
      FREE: ['basic_floor_plan', 'email_notifications'],
      STARTER: [...FREE, 'waitlist', 'analytics', 'sms'],
      PROFESSIONAL: [...STARTER, 'api', 'dynamic_pricing', 'recurring'],
      ENTERPRISE: ['*'], // All features
    }
    return featureMap[venue.subscriptionTier].includes(feature) || featureMap[venue.subscriptionTier].includes('*')
  }
}
```

### Benefits of This Model

✅ **Lower Barrier**: Free tier removes friction for adoption
✅ **Sustainable**: Paid tiers ensure revenue
✅ **Fair**: Pay for what you use (usage-based limits)
✅ **Scalable**: Clear upgrade path as venues grow
✅ **Prevents Abuse**: Usage limits prevent free tier abuse
✅ **Conversion Funnel**: Natural progression from free → paid
✅ **Predictable Revenue**: Subscription model (vs commission only)

### Migration Path

**Early Adopters (Beta)**:

- Free Professional tier for 6-12 months
- Shows appreciation, builds loyalty
- Creates testimonials/case studies

**After Beta**:

- Existing users: Offer 50% discount for first year
- New users: Standard pricing

---

## Business Model Ideas (Additional)

- Premium placement/search ranking (feature in paid tiers)
- White-label for hotel chains (Enterprise tier)
- Marketplace integrations (commission-based add-on)

---

## MVP Scope (Phase 1)

**Must Have**:

1. Visual floor-plan editor & booking
2. Venue CRUD
3. Spot/Resource CRUD
4. Booking creation & management
5. Real-time availability (WebSockets)
6. Basic notifications
7. Smart filters (not ML yet)
8. Clean host dashboard (tablet view)

**Phase 1.5**:

- Waitlist
- Booking reminders
- Basic analytics
- Payment integration (optional)

**Future Phases**:

- ML recommendations
- AR features
- Advanced analytics
- Mobile apps
- White-label solutions

---

## Design Decisions (To Finalize)

1. **Booking Confirmation**: Auto-confirm vs manual approval? (Configurable per venue)
2. **Spot Assignment**: Customer chooses vs auto-assign vs preferences?
3. **Duration**: Fixed vs flexible? (Configurable per venue)
4. **Cancellation Policy**: Time-based rules? Fees? (Configurable per venue)
5. **Guest Information**: Require registration vs guest bookings?
6. **Overbooking**: Allow with smart algorithms?

---

## Key Differentiators

1. **Visual floor-plan booking** (major UX advantage)
2. **Generic resource model** (future-proof for other use cases)
3. **Real-time everything** (WebSocket-powered)
4. **Smart matching** (not just availability, but experience-based)
5. **Flexible & optional** (venues can disable features)

---

## Architecture Summary

### Core Design Decisions

**1. Role + Ownership Hybrid Model**

- Base roles: `ADMIN`, `USER`
- Ownership: Users own/manage venues (many-to-many)
- Access control: Verify both role AND ownership
- Benefits: Flexible, secure, multi-tenant ready

**2. Generic Resource Abstraction**

- All bookable entities inherit from `Resource` interface
- Type-specific metadata in JSON fields
- Strategy pattern for availability & pricing rules
- Benefits: Extensible, reusable logic, future-proof

**3. Canvas-Based Floor Plans**

- HTML5 Canvas/SVG editor for owners
- JSON storage (vector data, not images)
- Real-time WebSocket updates
- Benefits: Flexible, performant, scalable

**4. Event-Driven & Real-Time**

- WebSocket infrastructure for live updates
- Event-driven notifications
- Redis caching with smart invalidation
- Benefits: Responsive UX, scalable architecture

**5. Repository Pattern & Dependency Injection**

- Interface-based repositories
- Strategy pattern for business rules
- Pluggable components (pricing, availability, notifications)
- Benefits: Testable, maintainable, extensible

### Extensibility Points

The architecture is designed for easy extension:

1. **New Resource Types**: Add to enum, extend metadata JSON
2. **New Availability Rules**: Implement `AvailabilityStrategy` interface
3. **New Pricing Models**: Implement `PricingStrategy` interface
4. **New Notification Channels**: Extend notification service
5. **New Roles**: Add to `RolesEnum`, update guards
6. **New Venue Features**: Add optional fields, extend settings JSON

### Integration with Existing Systems

- ✅ **Auth**: Extend `RolesEnum`, use existing guards & session system
- ✅ **WebSockets**: Use `user-presence` module patterns
- ✅ **Notifications**: Use existing notification service
- ✅ **Payments**: Optional integration with Stripe
- ✅ **Redis**: Use existing Redis module for caching & locks
- ✅ **Prisma**: Add new schema file, reuse existing patterns
