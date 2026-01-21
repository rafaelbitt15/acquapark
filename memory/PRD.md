# Acqua Park Prazeres da Serra - Product Requirements Document

## Original Problem Statement
Build a complete, launch-ready website for a water park named "Acqua Park Prazeres da Serra" with:
1. Public-facing website with pages for Home, Attractions, Tickets, and Contact
2. Mercado Pago integration for online ticket sales
3. Admin Panel for managing all site content
4. Customer accounts for registration, login, and viewing purchased tickets
5. LGPD/Cookie compliance with consent banner and legal pages
6. Ticket inventory and validation system with staff check-in functionality
7. Ability to add/remove ticket types through admin panel

**User's Preferred Language:** Português (Brazilian Portuguese)

---

## What's Been Implemented

### ✅ Core Website (Complete)
- **Home Page**: Hero section, features, attractions preview, testimonials
- **Attractions Page**: Full list of park attractions with categories
- **Tickets Page**: Ticket types display with pricing
- **Contact Page**: Contact form with validation

### ✅ Admin Panel (Complete)
- **Authentication**: JWT-based admin login
- **Dashboard**: Overview stats and recent activity
- **Content Management**:
  - Attractions Manager (CRUD)
  - Ticket Types Manager (CRUD) - **NEW: Add/Remove ticket types**
  - Park Info Manager
  - Testimonials Manager
  - FAQs Manager
  - Mercado Pago Configuration
- **Ticket Inventory System** (NEW):
  - Availability Manager - Configure daily ticket quantities
  - Staff Manager - Create/manage staff accounts for check-in

### ✅ Customer System (Complete)
- Customer registration with CPF validation
- Customer login with JWT
- "My Account" page for viewing purchased tickets

### ✅ Staff Check-In System (NEW - Complete)
- Dedicated `/check-in` page for staff
- Staff login with separate JWT tokens
- Ticket validation with unique codes (TKT-XXXXXXXXXXXX format)
- Prevents ticket reuse (marks as validated)
- Shows customer and order details upon validation

### ✅ Legal Compliance (Complete)
- LGPD-compliant cookie consent banner
- Privacy Policy page
- Terms of Service page

### ✅ Branding (Complete)
- Custom logo integration
- Favicon updated

---

## Technical Architecture

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── server.py           # Main FastAPI app with all routers
├── routes.py           # Admin content management routes
├── customer_routes.py  # Customer auth & Mercado Pago integration
├── ticket_routes.py    # Ticket availability, staff, validation
├── models.py           # Core Pydantic models
├── customer_models.py  # Customer-related models
├── ticket_models.py    # Ticket/staff models
├── auth.py             # JWT authentication
└── requirements.txt    # Python dependencies
```

### Frontend (React + TailwindCSS + Shadcn/UI)
```
/app/frontend/src/
├── pages/
│   ├── Home.jsx, Attractions.jsx, Tickets.jsx, Contact.jsx
│   ├── CustomerLogin.jsx, CustomerRegister.jsx, CustomerAccount.jsx
│   ├── StaffCheckIn.jsx          # NEW: Staff validation page
│   └── admin/
│       ├── Dashboard.jsx, AdminLayout.jsx, AdminLogin.jsx
│       ├── TicketsManager.jsx     # Updated: Add/remove ticket types
│       ├── AvailabilityManager.jsx # NEW: Daily inventory control
│       ├── StaffManager.jsx       # NEW: Staff CRUD
│       └── [other managers...]
├── components/
│   ├── Header.jsx, Footer.jsx, CookieBanner.jsx
│   └── ui/                        # Shadcn components
└── stores/                        # Zustand state management
```

### Database Collections (MongoDB)
- `users` - Admin accounts
- `customers` - Customer accounts
- `attractions` - Park attractions
- `tickets` - Ticket types (adult, child, family, etc.)
- `ticket_availability` - Daily ticket inventory
- `staff_users` - Staff accounts for check-in
- `orders` - Customer orders with ticket codes
- `park_info`, `testimonials`, `faqs`, `contacts`

---

## API Endpoints

### Public
- `GET /api/health` - Health check
- `GET /api/attractions` - List attractions
- `GET /api/tickets` - List ticket types
- `GET /api/check-availability/{date}?quantity=N` - Check availability

### Admin (Protected)
- `POST /api/auth/login` - Admin login
- `POST/PUT/DELETE /api/admin/tickets/{id}` - Ticket types CRUD
- `GET/POST/PUT/DELETE /api/admin/ticket-availability` - Inventory CRUD
- `GET/POST/DELETE /api/admin/staff` - Staff CRUD

### Staff (Protected)
- `POST /api/staff/login` - Staff login
- `GET /api/staff/me` - Get staff info
- `POST /api/staff/validate-ticket` - Validate ticket code
- `GET /api/staff/ticket-info/{code}` - Get ticket details

### Customer
- `POST /api/customers/register` - Register
- `POST /api/customers/login` - Login
- `GET /api/customers/my-orders` - Get orders

---

## Credentials

### Admin Access
- **URL**: `/admin/login`
- **Email**: `bitencourt.rafandrade@gmail.com`
- **Password**: `Rafa2188`

### Staff Access
- **URL**: `/check-in`
- Staff accounts created via Admin Panel → Funcionários

---

## Prioritized Backlog

### P1 - Next Priority
- [ ] QR Code generation for each ticket sold (display in customer account)
- [ ] Complete Mercado Pago payment flow integration
- [ ] Email notifications for order confirmation

### P2 - Future Enhancements
- [ ] Orders management page in admin panel
- [ ] Contact messages management page
- [ ] Analytics dashboard with sales reports
- [ ] Mobile-optimized check-in app
- [ ] Multi-language support

### P3 - Nice to Have
- [ ] Bulk availability configuration (date ranges)
- [ ] Promotional codes/discounts
- [ ] Waiting list for sold-out dates
- [ ] Integration with other payment gateways

---

## Testing

### Test Files
- `/app/tests/test_ticket_system.py` - Backend API tests (23 tests)
- `/app/test_reports/iteration_1.json` - Latest test report

### Test Results (Latest)
- **Backend**: 23/23 tests passed (100%)
- **Frontend**: All flows working (100%)

---

*Last Updated: January 2026*
