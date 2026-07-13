# Sanare Portfolio App — Project Documentation

## 1) Project overview
This repository is a **React + TypeScript + Vite** single-page application that renders a safari/portfolio website with:
- Public marketing pages (hero, services, FAQs, contact form, etc.)
- A **Portfolio** page showing photos in a responsive grid with category filtering and lightbox behavior
- An **Admin Studio** behind authentication that allows:
  - Uploading portfolio photos to **Supabase Storage**
  - Managing photo metadata in a **Supabase Postgres table** (titles, categories, sort order)
  - Editing photo details and cropping images via an edit dialog
  - Managing **Services** (create/update/delete + drag-and-drop ordering)
  - Managing **Video Reels** via Supabase (UI is partially wired)

## 2) Tech stack (what it’s built with)
### Frontend
- **React 19** (`react`, `react-dom`)
- **TypeScript**
- **Vite** (dev/build tooling)
- **react-router-dom** for routing
- **@tanstack/react-query** for server state (Supabase calls)
- **Tailwind CSS v4** + `@tailwindcss/vite`
- **shadcn/ui-style components** located in `src/components/ui/*`
- **lucide-react / react-icons / framer-motion / recharts** (used by various sections/components)

### Drag-and-drop / UI libraries
- **@dnd-kit/core** + **@dnd-kit/sortable** for drag-and-drop reordering (Admin services + photos)
- **sonner** for toast notifications
- **react-easy-crop** for image crop UI inside the edit dialog

### Backend (BaaS)
- **Supabase** via `@supabase/supabase-js`
  - Storage buckets:
    - `portfolio` (public photos)
    - (also referenced) `video_reels` for reel videos/thumbnails
  - Database tables (referenced in code):
    - `photos`
    - `services`
    - `video_reels`
  - Supabase Auth:
    - Admin page is protected using session checks
    - Login uses `supabase.auth` flows
  - A Supabase Edge Function is referenced for contact submissions:
    - `send-contact-inquiry` (under `supabase/functions/send-contact-inquiry/`)

## 3) Repository structure (high-level)
Top-level (relevant items):
- `README.md`, `QUICK_START_GUIDE.md`, `IMAGE_UPLOAD_IMPLEMENTATION_GUIDE.md`
- `SUPABASE_SETUP.sql`, plus other SQL files for services/reels/seed/migration
- `src/` (application code)
- `supabase/` (Edge function code)

Key app directories:
- `src/pages/*` — route-level pages
- `src/components/*` — reusable sections and feature components
- `src/components/common/*` — navbar/footer/shared UI
- `src/components/dialog/*` — edit dialogs (photo crop + service editor)
- `src/components/ui/*` — shadcn/ui base components
- `src/intergration/supabase/*` — Supabase client + generated types (note spelling: `intergration`)
- `src/types/*` — shared TS types
- `src/theme-init.ts`, `src/components/theme-provider.tsx` — theme management

## 4) Build & runtime configuration
### Vite
- `vite.config.ts`
  - React plugin
  - Tailwind plugin
  - Alias: `@` → `./src`

### TypeScript
- Uses project references via `tsconfig.*` files.
- Path alias configured in `tsconfig.json` as `@/*` → `src/*`.

### Deployment
- `vercel.json` exists.
- Vite SPA routing is handled by rewrite to `/index.html` via Vite configuration.

## 5) Application entry points & routing
### main app shell
- `src/main.tsx`
  - Mounts React root
  - Initializes theme on client
  - Wraps app in `ThemeProvider`

- `src/App.tsx`
  - Creates a `QueryClient` and wraps app in `QueryClientProvider`
  - Wraps app in router (`BrowserRouter`) and `TooltipProvider`
  - Routes:
    - `/` → `Index`
    - `/portfolio` → `PortfolioPage`
    - `/login` → `Login`
    - `/admin` → `RequireAuth` → `Admin`
    - `*` → `NotFound`

### Auth gating
- `src/components/RequireAuth.tsx`
  - Calls `supabase.auth.getSession()` and subscribes to auth state changes
  - While loading: shows a loading screen
  - If no session: navigates to `/login`

## 6) Supabase integration details
### Supabase client
- `src/intergration/supabase/client.ts`
  - Uses `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
  - Configures auth token persistence/refresh

### Public image URL handling
Portfolio photos are stored in Supabase Storage and accessed via public URLs:
- Common pattern: `supabase.storage.from('portfolio').getPublicUrl(storage_path)`
- Admin and public components compute `getPublicUrl` and pass URLs to `<img />`

### Database access patterns
- Public pages use `useQuery` to:
  - fetch `photos` rows
  - order by `sort_order`
  - filter by `category`
- Admin pages use `useQuery` + `useMutation` to:
  - insert into `photos`
  - update `photos` fields (title/category/storage_path)
  - delete from `photos`
  - update `sort_order` for drag-and-drop ordering

### Contact form integration
- `src/components/ContactSection.tsx` invokes:
  - `supabase.functions.invoke('send-contact-inquiry', { body: ... })`
- Edge function code is under:
  - `supabase/functions/send-contact-inquiry/index.ts`

## 7) Pages and what each does
### `src/pages/Index.tsx`
Public landing page composition using sections such as:
- `HeroSection`
- `VideoReelSection`
- `PortfolioSection`
- (and other marketing components)

### `src/pages/PortfolioPage.tsx`
Public portfolio page (full gallery behavior). Uses Supabase photo queries and category filtering.

### `src/pages/Login.tsx`
Admin login:
- Uses `supabase.auth` to authenticate
- On success, user is routed to `/admin`

### `src/pages/Admin.tsx` (Admin Studio)
Main admin console. Major features:
1. **Services management**
   - Fetches `services` ordered by `sort_order`
   - Create/update/delete via `supabase.from('services')`
   - Drag-and-drop reordering using dnd-kit

2. **Portfolio photos management**
   - Fetches `photos` ordered by `sort_order`
   - Upload photos:
     - uploads files to Storage bucket `portfolio`
     - inserts photo rows into `photos`
     - uses `sort_order` based on existing photo count + index
   - Reordering photos:
     - drag-and-drop updates `sort_order`
   - Delete photo:
     - removes storage object
     - deletes DB row

3. **Edit photo dialog (crop + details)**
   - Uses `src/components/dialog/PhotoEditDialog.tsx`
   - Admin saves:
     - updated title/category via DB update
     - cropped image by uploading a new file, updating `photos.storage_path` and `photos.image_url`, and deleting the old object

4. **Reels management (partial)**
   - Fetches from `video_reels` table
   - `AdminReelsSection` renders reel UI
   - In code, reels UI is noted as “temporary / not yet wired in” in some areas

### `src/pages/AdminReelsSection.tsx`
Renders reels management UI (grid/list) and handles reel selection/actions.

### `src/pages/NotFound.tsx`
Catch-all page for unknown routes.

## 8) Component architecture (feature-level map)
### Hero & marketing
- `src/components/HeroSection.tsx` — hero visuals and headline content
- `src/components/AboutSection.tsx` — about content
- `src/components/ServicesSection.tsx` — public services section
- `src/components/FAQSection.tsx` — FAQ accordion
- `src/components/TestmonialSection.tsx` — testimonials (note filename is `TestmonialSection.tsx`, spelling as-is)
- `src/components/ContactSection.tsx` — contact form + Supabase Edge function invocation

### Portfolio
- `src/components/PortfolioSection.tsx`
  - Fetches a limited set of `photos` ordered by `sort_order`
  - Category filtering (e.g., All/Weddings/Portraits/etc.)

- `src/pages/PortfolioPage.tsx`
  - Full portfolio page behavior

### Comparison slider
- `src/components/ComparisonSlider.tsx`
  - Likely used for before/after image comparisons (assets include `before-edit.jpeg`, `after-edit.jpeg`)

### Video reels
- `src/components/VideoReelSection.tsx`
  - Fetches reels from `video_reels` table (via `supabase`)
  - Displays thumbnails/videos and supports selecting active reel

## 9) Admin image upload, editing, and deletion flows
### 9.1 Upload flow (Admin → Storage + DB)
In `src/pages/Admin.tsx`:
1. Admin selects:
   - category (select component)
   - multiple images (file input)
2. For each chosen file, the UI creates a preview URL and a default title derived from filename.
3. Upload mutation:
   - Generates a unique storage path: `${Date.now()}-${random}.${ext}`
   - Uploads file to Storage bucket `portfolio`
   - Creates a `photos` row with:
     - `title`
     - `category`
     - `image_url` (public URL)
     - `storage_path`
     - `sort_order`
4. On success:
   - invalidates queries so public and admin galleries refresh
   - resets form state

### 9.2 Photo deletion flow
In `src/pages/Admin.tsx`:
1. Delete mutation:
   - removes storage object from `portfolio`
   - deletes the row from `photos` by `id`
2. On success:
   - invalidates admin + public portfolio query caches

### 9.3 Photo editing flow (details + crop)
Edit UI:
- `src/components/dialog/PhotoEditDialog.tsx`
  - “Details” tab: edit title/category
  - “Crop” tab: uses `react-easy-crop` and exports cropped region to a JPEG blob using canvas

Save behavior in `src/pages/Admin.tsx`:
- “Details” save:
  - updates `photos.title` and `photos.category` by `id`
- “Crop” save:
  - uploads cropped blob as a new image file
  - updates `photos.storage_path` and `photos.image_url`
  - deletes the old storage object

## 10) Services management flow (Admin)
In `src/pages/Admin.tsx`:
- Reads `services` table ordered by `sort_order`
- Reordering:
  - drag-and-drop updates `sort_order` via batch `update` statements
- Editing:
  - `src/components/dialog/ServiceEditDialog.tsx` provides a modal editor
- Deleting:
  - deletes from `services` by `id`

## 11) Edge function (contact inquiry)
- Located at `supabase/functions/send-contact-inquiry/index.ts`
- `ContactSection` calls it using `supabase.functions.invoke`.
- SQL files in the repo likely support creating any required backend schema.

## 12) Database / SQL artifacts
- `SUPABASE_SETUP.sql` — core schema (photos, storage policies, etc. depending on contents)
- `SUPABASE_SERVICES_MIGRATION.sql`, `SUPABASE_SERVICES_SEED.sql` — services schema and seed data
- `SUPABASE_VIDEO_REELS.sql` — reels schema/data setup

These files are intended to be run in Supabase SQL editor to create the required tables and policies.

## 13) Environment variables
Required values are referenced via `import.meta.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

(Edge function and admin auth flows also depend on Supabase config done in your Supabase project.)

## 14) Notable conventions / implementation notes
- **Query keys** are used to link admin changes to public UI refresh:
  - Admin photos: `['admin-photos']`
  - Public portfolio home: `['portfolio-photos-home', ...]` (varies by component)
- Sorting:
  - photos and services rely on integer `sort_order`.
  - drag-and-drop persists ordering by writing `sort_order` values.
- Folder naming:
  - Supabase client folder is spelled `src/intergration/supabase/*` (typo preserved).

## 15) How to extend the project
Common extension points:
- Add new categories:
  - update category lists in Admin and Portfolio UI
  - ensure DB values match
- Add new admin-managed entities:
  - follow the Admin pattern: `useQuery` for read, `useMutation` for write, and `invalidateQueries` for refresh
- Add new public sections:
  - create a new component in `src/components/*` and add it into a page (`Index`, `PortfolioPage`, etc.)

---

## Appendix: key files (quick index)
### App shell / routing
- `src/main.tsx`
- `src/App.tsx`
- `src/components/RequireAuth.tsx`

### Public pages
- `src/pages/Index.tsx`
- `src/pages/PortfolioPage.tsx`

### Admin
- `src/pages/Admin.tsx`
- `src/pages/AdminReelsSection.tsx`
- `src/pages/Login.tsx`

### Core dialogs
- `src/components/dialog/PhotoEditDialog.tsx`
- `src/components/dialog/ServiceEditDialog.tsx`

### Supabase integration
- `src/intergration/supabase/client.ts`
- `src/intergration/supabase/types.ts`

### SQL + Edge functions
- `SUPABASE_SETUP.sql`, `SUPABASE_SERVICES_*`, `SUPABASE_VIDEO_REELS.sql`
- `supabase/functions/send-contact-inquiry/index.ts`

