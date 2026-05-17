# Yakoyo Restaurant Website

A modern, full-stack restaurant website built with React, Supabase, and Paystack payment integration.

## Features

- **Authentication System**: User registration, login, and role-based access (customer/admin)
- **Customer Dashboard**: Profile management, order history, reservations
- **Admin Dashboard**: Complete restaurant management (orders, reservations, menu, customers, settings)
- **Menu Management**: Dynamic menu with categories and availability
- **Online Ordering**: Cart system with Paystack payment integration
- **Reservations**: Table booking system
- **Responsive Design**: Mobile-first design with dark luxury theme

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth, Database, Storage)
- **Payments**: Paystack
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Production Setup Checklist

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Enable Row Level Security (RLS) policies for all tables
4. Set up authentication providers (Email/Password enabled by default)

### 2. Paystack Setup

1. Create a Paystack account at [paystack.com](https://paystack.com)
2. Get your Public Key from the dashboard
3. Add the key to your environment variables (see `.env.example`)

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### 4. Admin User Setup

1. Register a user account through the website
2. In Supabase Dashboard, go to Table Editor → profiles
3. Find your user and change the `role` field to 'admin'

### 5. Database Policies

Ensure these RLS policies are active:

- **profiles**: Users can view/update their own profile
- **orders**: Authenticated users can create orders, admins can view all
- **reservations**: Authenticated users can create reservations, admins can view all
- **menu_items**: Public read, admin write
- **restaurant_settings**: Admin read/write

### 6. Storage Setup (Optional)

If using image uploads for menu items:
1. Create a "menu-images" bucket in Supabase Storage
2. Set bucket to public
3. Configure appropriate RLS policies

### 7. Build and Deploy

```bash
npm run build
```

Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.)

### 8. Domain Configuration

- Update Paystack webhook URLs if needed
- Configure domain in Supabase for production URLs

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## File Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React context providers
├── pages/              # Page components
│   ├── admin/          # Admin dashboard pages
│   └── ...             # Public pages
├── lib/                # Utility libraries
└── utils/              # Helper functions
```

## Key Components

- **AuthContext**: Manages authentication state
- **ProtectedRoute**: Guards authenticated routes
- **AdminRoute**: Guards admin-only routes
- **Order**: Handles cart and Paystack payment
- **Dashboard**: Customer profile management
- **AdminLayout**: Admin dashboard layout with navigation

## Database Schema

- **profiles**: User profiles with roles
- **menu_items**: Restaurant menu items
- **orders**: Customer orders with payment info
- **reservations**: Table reservations
- **restaurant_settings**: Restaurant configuration

## Payment Flow

1. Customer adds items to cart
2. Guest users are prompted to create account or continue as guest
3. Paystack popup handles payment processing
4. Order is saved to database with payment confirmation
5. Customer receives order confirmation

## Security Features

- Row Level Security (RLS) on all database tables
- JWT-based authentication
- Protected admin routes
- Input validation with Zod schemas
- Secure payment processing via Paystack

## Customization

- **Theme**: Dark luxury theme with orange accents
- **Fonts**: Playfair Display (serif) + Inter (sans-serif)
- **Colors**: Configurable via Tailwind CSS custom properties
- **Currency**: Nigerian Naira (₦) formatting
- **Delivery Fee**: Configurable in admin settings

## Support

For issues or questions, check the code comments or create an issue in the repository.
