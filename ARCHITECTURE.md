# CTSS Architecture Documentation

## 📐 Kiến trúc Tổng quan

CTSS được xây dựng theo kiến trúc modular với Next.js 14 App Router, sử dụng TypeScript cho type safety và Prisma ORM cho database operations.

## 🏗️ Cấu trúc Thư mục

```
ctss/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (RESTful)
│   │   ├── bookings/            # Booking endpoints
│   │   │   ├── [id]/            # Dynamic routes
│   │   │   └── route.ts         # GET, POST
│   │   ├── customers/           # Customer/CRM endpoints
│   │   ├── inventory/           # Inventory endpoints
│   │   ├── pos/                 # POS/Transaction endpoints
│   │   ├── reports/             # Reports endpoints
│   │   ├── services/            # Services endpoints
│   │   ├── settings/            # Settings endpoints
│   │   └── staff/               # Staff endpoints
│   ├── dashboard/               # Dashboard module page
│   ├── booking/                 # Booking module page
│   ├── crm/                     # CRM module page
│   ├── services/                # Services module page
│   ├── inventory/               # Inventory module page
│   ├── staff/                   # Staff module page
│   ├── pos/                     # POS module page
│   ├── reports/                 # Reports module page
│   ├── settings/                # Settings module page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (redirects to dashboard)
│   └── globals.css              # Global styles
│
├── components/                   # React Components
│   ├── layout/                  # Layout components
│   │   ├── MainLayout.tsx       # Main layout wrapper
│   │   ├── Sidebar.tsx          # Sidebar navigation (240px)
│   │   └── Header.tsx            # Top header (72px)
│   └── ui/                      # Design System components
│       ├── Button.tsx           # Button component
│       ├── Input.tsx            # Input component
│       ├── Card.tsx             # Card component
│       ├── Table.tsx            # Table components
│       ├── Modal.tsx            # Modal dialog
│       ├── Drawer.tsx           # Side drawer
│       ├── Tabs.tsx             # Tabs component
│       └── Calendar.tsx         # Calendar component
│
├── lib/                          # Utilities & Helpers
│   ├── prisma.ts                # Prisma client singleton
│   ├── utils.ts                 # Utility functions
│   └── api-response.ts          # API response helpers
│
├── prisma/                       # Database
│   └── schema.prisma             # Prisma schema (33 tables)
│
├── store/                        # Zustand State Management
│   ├── useAuthStore.ts          # Authentication store
│   └── useUIStore.ts            # UI state store
│
└── public/                       # Static assets
```

## 🎨 Design System

### Layout Specifications

- **Sidebar**: 240px width, fixed position, dark theme
- **Header**: 72px height, fixed position, white background
- **Main Content**: Auto margin-left (240px) and margin-top (72px)

### Component Variants

#### Button
- `primary`: Blue background, white text
- `secondary`: Gray background
- `outline`: Border only
- `ghost`: No background
- `danger`: Red background
- Sizes: `sm`, `md`, `lg`

#### Input
- Standard text input
- Supports label, error, helperText
- Focus states with primary color

#### Card
- White background with border
- Optional title, description, footer
- Rounded corners with shadow

#### Table
- Full-width table
- Header with gray background
- Hover states on rows
- Responsive with horizontal scroll

#### Modal
- Overlay with backdrop
- Sizes: `sm`, `md`, `lg`, `xl`
- Optional title, description, footer

#### Drawer
- Side drawer from left/right
- Sizes: `sm`, `md`, `lg`
- Overlay with backdrop

#### Tabs
- Tab navigation component
- Context-based state management
- Active state styling

#### Calendar
- Date picker component
- Vietnamese locale support
- Date selection with min/max constraints

## 🗄️ Database Architecture

### Schema Organization

Database được tổ chức thành các nhóm chức năng:

1. **User & Authentication** (2 tables)
   - User, UserPermission

2. **Staff Management** (2 tables)
   - Staff, StaffShift

3. **Customer Management** (2 tables)
   - Customer, LoyaltyHistory

4. **Services** (3 tables)
   - ServiceCategory, Service, StaffService

5. **Booking** (2 tables)
   - Booking, BookingItem

6. **Inventory** (3 tables)
   - ProductCategory, Product, InventoryLog

7. **POS & Transactions** (3 tables)
   - Transaction, TransactionItem, Payment

8. **Reports** (1 table)
   - Report

9. **Settings** (1 table)
   - Setting

10. **Notifications & Logs** (2 tables)
    - Notification, AuditLog

**Tổng cộng: 33 tables**

### Key Relationships

- User → Staff (1:1)
- Customer → Booking (1:N)
- Customer → Transaction (1:N)
- Staff → Booking (1:N)
- Service → BookingItem (1:N)
- Product → TransactionItem (1:N)
- Transaction → Payment (1:N)

## 🔌 API Architecture

### RESTful Endpoints

Tất cả API routes tuân theo RESTful conventions:

- `GET /api/resource` - List resources
- `POST /api/resource` - Create resource
- `GET /api/resource/[id]` - Get resource by ID
- `PUT /api/resource/[id]` - Update resource
- `DELETE /api/resource/[id]` - Delete resource

### Response Format

```typescript
// Success Response
{
  success: true,
  data: T,
  message?: string
}

// Error Response
{
  success: false,
  error: string
}
```

### Query Parameters

Common query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `status`: Filter by status
- `dateFrom`, `dateTo`: Date range filters

## 🗂️ State Management

### Zustand Stores

#### useAuthStore
- User authentication state
- Token management
- Login/logout functions
- Persisted to localStorage

#### useUIStore
- UI state (sidebar, theme)
- Toggle functions
- Client-side only

## 🎯 Module Structure

Mỗi module bao gồm:

1. **Page Component** (`app/[module]/page.tsx`)
   - Main page với MainLayout
   - UI components từ Design System

2. **API Routes** (`app/api/[module]/route.ts`)
   - GET: List với pagination, search, filters
   - POST: Create với validation

3. **Dynamic Routes** (`app/api/[module]/[id]/route.ts`)
   - GET: Get by ID
   - PUT: Update
   - DELETE: Delete

## 🔐 Security Considerations

1. **Environment Variables**
   - Database credentials in `.env`
   - JWT secret for authentication
   - Never commit `.env` to version control

2. **Input Validation**
   - Validate all API inputs
   - Use Prisma type safety
   - Handle errors gracefully

3. **Database**
   - Use Prisma ORM for SQL injection protection
   - Implement proper indexes
   - Use transactions for critical operations

## 📦 Dependencies

### Core
- `next`: 14.2.5
- `react`: ^18.3.1
- `typescript`: ^5.5.4

### Database
- `@prisma/client`: ^5.18.0
- `prisma`: ^5.18.0

### UI & Styling
- `tailwindcss`: ^3.4.10
- `lucide-react`: ^0.424.0
- `clsx`: ^2.1.1
- `tailwind-merge`: ^2.4.0

### State & Utils
- `zustand`: ^4.5.4
- `date-fns`: ^3.6.0

## 🚀 Development Workflow

1. **Setup**
   ```bash
   npm install
   cp .env.example .env
   npm run db:generate
   npm run db:push
   ```

2. **Development**
   ```bash
   npm run dev
   ```

3. **Database Changes**
   ```bash
   # Update schema.prisma
   npm run db:generate
   npm run db:migrate
   ```

4. **Build**
   ```bash
   npm run build
   npm run start
   ```

## 📝 Best Practices

1. **Type Safety**
   - Use TypeScript for all files
   - Define interfaces for API responses
   - Use Prisma generated types

2. **Code Organization**
   - Group by feature/module
   - Reuse components from Design System
   - Keep API routes focused and single-purpose

3. **Error Handling**
   - Use try-catch in all API routes
   - Return consistent error responses
   - Log errors appropriately

4. **Performance**
   - Use Prisma select to limit fields
   - Implement pagination for lists
   - Use indexes for frequently queried fields

5. **Accessibility**
   - Use semantic HTML
   - Add ARIA labels where needed
   - Ensure keyboard navigation

---

*Last updated: 2024*

