# Migration Plan: Supabase → Django REST Framework

## Current Supabase dependencies identified in frontend

- `menu_items` → Bakery products / items
- `reservations` → Catering bookings / event requests
- `orders` → Bakery orders
- `profiles` → User profiles / customer accounts
- `restaurant_settings` → Site settings / delivery configuration
- `gallery_images` → Gallery media
- `menu-images` / storage buckets → Menu and gallery image storage
- `newsletter_subscribers` → Marketing subscribers
- `notifications` → Admin event or booking notifications

## Proposed Django mapping

- `users.CustomUser` / `profiles`
  - `email`, `phone`, `role`, `profile_image`
  - JWT auth via DRF Simple JWT

- `products.Product`
  - `name`, `description`, `price`, `category`, `image_url`, `available`, `featured`

- `orders.Order`
  - `user`, `customer_email`, `customer_name`, `customer_phone`, `delivery_address`, `city`, `landmark`, `delivery_notes`, `items`, `subtotal`, `delivery_fee`, `total`, `payment_reference`, `status`

- `bookings.Booking`
  - `client_name`, `email`, `phone`, `service_type`, `event_date`, `event_time`, `guest_count`, `notes`, `status`

- `gallery.GalleryImage`
  - `image_url`, `caption`, `category`, `storage_path`

- `payments.Payment`
  - `order`, `transaction_reference`, `amount`, `status`, `metadata`, `verified_at`

## Phase 1 takeaways

- Frontend currently uses Supabase auth and storage in multiple locations.
- The safest first step is to preserve current UI while adding a Django backend scaffold.
- Backend should support PostgreSQL, Cloudinary storage, JWT auth, and Paystack verification.
- Frontend branding should be updated first, while API migration happens incrementally.

## Next incremental backend steps

1. Build Django REST endpoints for `products` and `orders`.
2. Replace `supabase.from('menu_items')` with `/api/products/`.
3. Add auth endpoints and begin swapping `AuthContext` from Supabase to JWT.
4. Migrate image uploads from Supabase storage to Cloudinary.
5. Add Paystack verification route in `payments`.
6. Update bookings flow to use Django booking endpoints.
