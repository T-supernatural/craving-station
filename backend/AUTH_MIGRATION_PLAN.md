# Auth Migration Plan

## 1. Current Auth Architecture

### AuthContext architecture
- `src/context/AuthContext.jsx` is the central auth provider.
- It initializes auth state by calling `supabase.auth.getSession()`.
- It listens for auth state changes using `supabase.auth.onAuthStateChange(...)`.
- It exposes:
  - `user`
  - `session`
  - `loading`
  - `signIn(email, password)`
  - `signUp(email, password, metadata)`
  - `signOut()`
  - `resetPassword(email)`
- `signUp()` also creates a Supabase `profiles` record after successful user creation.

### Supabase auth usage
- Supabase auth is the current source of truth for session state.
- The app does not manually store JWTs in local storage.
- Browser session persistence is handled by Supabase client internally.
- Auth actions are:
  - `supabase.auth.signInWithPassword(...)`
  - `supabase.auth.signUp(...)`
  - `supabase.auth.signOut()`
  - `supabase.auth.resetPasswordForEmail(...)`
- User profile data is split between Supabase auth user metadata and the `profiles` table.

### Session persistence flow
- `AuthContext` loads existing session on mount via `getSession()`.
- `AuthContext` updates state on auth event changes.
- No explicit `localStorage` or `sessionStorage` storage is used for auth.
- Only shopping cart data is persisted in `localStorage` via `cravingstation-cart`.

### Protected routes
- `src/components/ProtectedRoute.jsx` protects `/dashboard`.
- `src/components/AdminRoute.jsx` protects `/admin/*` routes.
- If a user is not authenticated, both redirect to `/login`.

### Admin-only flows
- `AdminRoute.jsx` determines admin status by fetching `profiles.role` from Supabase.
- Admin pages are:
  - `/admin`
  - `/admin/orders`
  - `/admin/reservations`
  - `/admin/menu`
  - `/admin/customers`
  - `/admin/gallery`
  - `/admin/settings`
- The customer dashboard also redirects to `/admin` if `profile.role === 'admin'`.

### AuthContext consumers
- `src/pages/Login.jsx`
- `src/pages/Register.jsx`
- `src/pages/ForgotPassword.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/admin/AdminLayout.jsx`
- `src/components/Navbar.jsx`
- `src/components/dashboard/ProfileTab.jsx`
- `src/components/dashboard/OrderHistoryTab.jsx`
- `src/components/dashboard/ReservationsTab.jsx`
- `src/pages/Order.jsx`

### Profile/account and order dependencies
- `Dashboard.jsx` fetches profile and order count from Supabase using `user.id`.
- `ProfileTab.jsx` loads and updates the Supabase `profiles` record.
- `OrderHistoryTab.jsx` queries `orders` by `user_id`.
- `ReservationsTab.jsx` queries `reservations` by `user_id`.
- `Order.jsx` uses `useAuth()` to fill contact fields and determine the current customer.
- `Register.jsx` supplies complementary user metadata for the profile record.

### Password reset flow
- `ForgotPassword.jsx` uses `AuthContext.resetPassword(email)`.
- That calls `supabase.auth.resetPasswordForEmail(email)`.
- The app currently relies fully on Supabase-managed password reset.

## 2. Django JWT Replacement Strategy

### Goals
- Introduce Django REST Framework JWT auth endpoints.
- Keep Supabase auth active until backend auth is validated.
- Preserve frontend behavior during migration.
- Provide a path for profile and role data to move from Supabase to Django.

### New backend auth targets
- `POST /api/auth/register/`
- `POST /api/auth/token/`
- `POST /api/auth/token/refresh/`
- `GET /api/auth/profile/`
- `PATCH /api/auth/profile/`

### Bridge strategy
1. Implement Django JWT auth endpoints in `backend/users`.
2. Keep frontend Supabase auth untouched.
3. Add backend profile read/write for Django users.
4. Create a migration/sync plan for Supabase `profiles` to Django `CustomUser`.
5. Later, update `AuthContext` to support Django JWT and reduce reliance on Supabase.

## 3. Safe Migration Order

1. **Backend readiness**
   - Add Django auth serializers, views, and routes.
   - Enable JWT auth via `rest_framework_simplejwt` in `settings.py`.
   - Make sure `CustomUser` is registered and available.

2. **Backend validation**
   - Test `register`, `token`, `refresh`, and `profile` endpoints manually.
   - Confirm JWT token issuance and profile access.

3. **Data sync planning**
   - Map Supabase `profiles` to Django `CustomUser`.
   - Ensure `role` and admin status are preserved.
   - Preserve email, phone, name, and any migrated profile data.

4. **Frontend dual-auth support**
   - Leave Supabase auth active in `AuthContext`.
   - Add a backend auth adapter layer if needed, without replacing current flow.
   - Use backend endpoints only for new auth verification during rollout.

5. **Switch-over**
   - Replace `AuthContext` auth calls with Django backend calls only after backend tests pass.
   - Keep Supabase session support as a fallback until fully stable.

## 4. Potential Breaking Points

- `user.id` mismatch between Supabase and Django if profile sync is not exact.
- Admin role lookup currently relies on Supabase `profiles.role`.
- Form-based registration metadata currently writes to Supabase `profiles`, not Django.
- Password reset is currently Supabase-managed and must be migrated carefully.
- Any frontend route protection change before backend readiness can lock out users.
- `Dashboard` and `ProfileTab` directly query Supabase; those must be updated after auth migration.

## 5. Rollback Considerations

- Preserve Supabase auth calls until Django auth is fully functional.
- Keep `AuthContext` and protected routes unchanged during initial backend rollout.
- Deploy Django auth endpoints behind `/api/auth/*` without modifying frontend consumers.
- If the backend fails, revert frontend calls to Supabase only and keep session behavior stable.
- Keep admin role checks on Supabase until Django role access is verified.

## 6. Frontend Components Dependent on Auth

- `src/context/AuthContext.jsx`
- `src/components/ProtectedRoute.jsx`
- `src/components/AdminRoute.jsx`
- `src/pages/Login.jsx`
- `src/pages/Register.jsx`
- `src/pages/ForgotPassword.jsx`
- `src/pages/Dashboard.jsx`
- `src/components/dashboard/ProfileTab.jsx`
- `src/components/dashboard/OrderHistoryTab.jsx`
- `src/components/dashboard/ReservationsTab.jsx`
- `src/components/Navbar.jsx`
- `src/pages/Order.jsx`
- `src/pages/admin/AdminLayout.jsx`

## 7. Backend Endpoints Required First

- `POST /api/auth/register/` — user registration and account creation
- `POST /api/auth/token/` — JWT access and refresh tokens
- `POST /api/auth/token/refresh/` — refresh access tokens
- `GET /api/auth/profile/` — current authenticated user details
- `PATCH /api/auth/profile/` — update current user profile

## Notes
- This first phase deliberately avoids replacing Supabase auth in the frontend.
- The objective is backend-readiness and migration planning, not immediate auth cutover.
- Local cart persistence is unaffected by this auth migration and can remain in place.
