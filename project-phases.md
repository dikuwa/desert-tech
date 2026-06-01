# Desert Technology Consultant — Build Phases

## Phase 1 — Foundation
**Goal:** Project scaffolded, design system applied, env files created, database connected, Redis cache configured, admin/staff auth working, and base layouts ready.

### Tasks
- [ ] Initialize Next.js 16 + shadcn/ui in ONE step: `pnpm dlx shadcn@latest init --preset b0 --template next`. **Do NOT use `--src-dir`** — the framework requires a flat root layout (`app/`, `components/`, `lib/` at the project root, no `src/` wrapper). If you fall back to `pnpm create next-app`, pass `--no-src-dir`.
- [ ] Confirm the resulting tsconfig has `"paths": { "@/*": ["./*"] }` and NOT `["./src/*"]`.
- [ ] Install the Form shadcn fallback: `pnpm dlx shadcn@latest add https://vibekit.desishub.com/r/form.json`.
- [ ] Create `.env.example` and `.env.local` with DATABASE_URL, UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN, BETTER_AUTH_SECRET, BETTER_AUTH_URL, RESEND_API_KEY, R2 credentials, and public site variables.
- [ ] Add `.env.local` to `.gitignore`.
- [ ] Set up Prisma v7 with Neon PostgreSQL.
- [ ] Set up Upstash Redis cache client in `lib/cache.ts` with `getCachedOrFetch()` and `invalidateTag()` wrappers.
- [ ] Apply the complete `design-style-guide.md` tokens to `app/globals.css` using Tailwind v4 CSS-first `@theme` config.
- [ ] Configure Inter as the primary font.
- [ ] Do NOT install next-themes. Dark mode is not supported in this project.
- [ ] Create public storefront layout with header, mobile menu, sticky WhatsApp/call CTA, cart icon, and footer.
- [ ] Create admin dashboard layout with collapsible sidebar, breadcrumbs, page header, notification icon, and role-aware navigation.
- [ ] Install JB Better Auth UI: `pnpm dlx shadcn@latest add https://better-auth-ui.desishub.com/r/auth-components.json`.
- [ ] Integrate installed auth files into existing routes. Do NOT overwrite existing `page.tsx` or `layout.tsx`; edit and merge.
- [ ] Configure Better Auth env vars and email/password auth for Admin and Staff only.
- [ ] Create protected route middleware for `/dashboard/*`.
- [ ] Build custom 404, error, and loading pages.
- [ ] Build shared formatters: `formatCurrencyNAD()` output like `N$ 4,500`.
- [ ] Verify: storefront loads, admin login works, protected dashboard redirects correctly, and no dark mode code exists.

### Dependencies
- Neon database created and DATABASE_URL set.
- Upstash Redis database created and Redis env vars set.
- Resend account created and RESEND_API_KEY set.
- Cloudflare R2 bucket created for product images and PDFs.

## Phase 2 — Core Storefront & Catalog
**Goal:** Customers can browse, search, filter, view products, add items to cart, and submit guest checkout orders.

### Tasks
- [ ] Define Prisma schema for User, Customer, Category, Product, ProductImage, Promotion, PromotionProduct, Order, OrderItem, PaymentRecord, Receipt, FollowUp, Notification, ContactMessage, and StoreSetting.
- [ ] Run migration: `pnpm db:push && pnpm db:generate`.
- [ ] Create `prisma/seed.ts` with 50+ realistic products across Apple Products, Windows Laptops, Gaming PCs, Desktop Computers, CCTV & Security, Networking, POS Systems, Accessories, Promotions, and Auto/Mechanical Services.
- [ ] Include realistic Namibia Dollar pricing such as `N$ 4,500`, `N$ 12,999`, and `N$ 850`.
- [ ] Add seed admin and staff users.
- [ ] Run seed: `pnpm db:seed`.
- [ ] Install JB Zustand Cart: `pnpm dlx shadcn@latest add https://jb.desishub.com/r/zustand-cart.json`.
- [ ] Build storefront API routes with Redis caching and server-side pagination for products, categories, promotions, product details, and search.
- [ ] Build homepage sections: hero, quick category tiles, featured promotions, featured products, services, WhatsApp CTA, and footer.
- [ ] Build `/shop` product listing with sidebar filters, search, sort, pagination, product condition badges, and quick actions.
- [ ] Build `/shop/[slug]` product detail page with gallery, product specs, price, condition, warranty, stock status, add-to-cart, and WhatsApp enquiry.
- [ ] Build `/cart` page with quantity controls, remove actions, estimated total, and checkout CTA.
- [ ] Build `/checkout` guest form using React Hook Form + Zod for full name, phone, WhatsApp number, email, preferred contact method, and notes.
- [ ] On successful checkout, create Customer, Order, and OrderItems.
- [ ] Trigger admin notification and optional email on new order.
- [ ] Build `/order-success/[orderNumber]` with next steps, call button, and WhatsApp button.
- [ ] Build `/services`, `/promotions`, and `/contact` pages.
- [ ] Add loading skeletons, empty states, Suspense, and ErrorBoundary to all data-fetching sections.
- [ ] Verify: cart persists, checkout creates order, WhatsApp links include useful order/product context, and all GET routes cache via Redis.

### Dependencies
- Phase 1 complete.

## Phase 3 — Admin Dashboard & Operations
**Goal:** Admins and staff can manage products, orders, customers, follow-ups, notifications, receipts, and promotions.

### Tasks
- [ ] Install JB Data Table: `pnpm dlx shadcn@latest add https://jb.desishub.com/r/data-table.json`.
- [ ] Build dashboard overview with stat cards: new orders, pending follow-ups, low stock products, paid orders, unpaid orders, and recent notifications.
- [ ] Build `/dashboard/orders` with Data Table, search, filters, status badges, pagination, Excel export, and PDF export.
- [ ] Build `/dashboard/orders/[id]` with order timeline, customer details, items, payment records, follow-ups, notes, receipt actions, and contact buttons.
- [ ] Build order status update mutations with Redis cache invalidation.
- [ ] Build payment record creation and update actions. Restrict financial records to Admin role.
- [ ] Build `/dashboard/products` with Data Table, search, filters, bulk publish/archive, stock status, and exports.
- [ ] Build product create/edit forms using React Hook Form + Zod.
- [ ] Build product image upload using Cloudflare R2.
- [ ] Build `/dashboard/categories` CRUD.
- [ ] Build `/dashboard/promotions` CRUD with promotion placement and active date ranges.
- [ ] Build `/dashboard/customers` with customer order history.
- [ ] Build `/dashboard/follow-ups` queue with due dates, assigned staff, notes, and completion status.
- [ ] Build `/dashboard/notifications` with read/unread actions.
- [ ] Build `/dashboard/staff` for Admin-only staff management and permission assignment.
- [ ] Build `/dashboard/settings` for store contact number, WhatsApp number, email, bank details, and receipt settings.
- [ ] Ensure every mutation invalidates related Redis cache tags.
- [ ] Verify role-based access for Admin and Staff.

### Dependencies
- Phase 2 complete.

## Phase 4 — Receipts, Files & Messaging
**Goal:** Admin can generate receipt PDFs, store files, and prepare receipt messages for email or WhatsApp.

### Tasks
- [ ] Install JB File Storage UI: `pnpm dlx shadcn@latest add https://file-storage.desishub.com/r/file-storage.json`.
- [ ] Configure Cloudflare R2 env vars and upload helpers.
- [ ] Install and configure `@react-pdf/renderer`.
- [ ] Build receipt PDF template with Desert Technology branding, customer details, order items, payment records, totals, banking details, and receipt number.
- [ ] Generate receipt PDF from `/dashboard/orders/[id]`.
- [ ] Store receipt PDF URL in Receipt model.
- [ ] Build receipt history page at `/dashboard/receipts`.
- [ ] Install and configure Resend + React Email.
- [ ] Build email templates for order received, receipt issued, and contact form received.
- [ ] Add “send receipt by email” action.
- [ ] Add “copy WhatsApp receipt message” action with receipt link.
- [ ] Verify PDF opens correctly, receipt data is accurate, and emails send in development/test mode.

### Dependencies
- Phase 3 complete.

## Phase 5 — Polish, Performance & QA
**Goal:** App is refined, responsive, secure, fast, and ready for production.

### Tasks
- [ ] Add subtle Framer Motion animations using transform and opacity only.
- [ ] Add mobile sticky WhatsApp and Call CTA.
- [ ] Refine product card hover states, badges, filters, and empty states.
- [ ] Test responsive design across mobile, tablet, laptop, and desktop.
- [ ] Test guest checkout without registration.
- [ ] Test product search by brand, name, category, SKU, and condition.
- [ ] Test all admin CRUD operations.
- [ ] Test role restrictions for Staff vs Admin.
- [ ] Test notifications, follow-ups, and low-stock alerts.
- [ ] Test receipt generation and email sending.
- [ ] Run bundle analysis and ensure heavy components are dynamically imported.
- [ ] Confirm all images use aspect ratio constraints and optimized loading.
- [ ] Confirm no online payment UI exists.
- [ ] Confirm all prices display in Namibia Dollar format.
- [ ] Run pre-deploy code review using `pre-deploy-review.md` from the VibeKit repo and save results to `pre-deploy-review-report.md`.
- [ ] Address all Critical findings.

### Dependencies
- Phase 4 complete.

## Phase 6 — Deploy
**Goal:** App is live on Vercel with production database, Redis, file storage, email, and domain configured.

### Tasks
- [ ] Set all environment variables in Vercel.
- [ ] Deploy to Vercel.
- [ ] Configure Cloudflare DNS and custom domain.
- [ ] Apply production database migrations.
- [ ] Verify production auth flows.
- [ ] Verify product image uploads in production.
- [ ] Verify receipt PDFs in production.
- [ ] Verify Resend sending domain.
- [ ] Verify WhatsApp and call links on mobile.
- [ ] Verify 404 and error pages.
- [ ] Run final production checklist.

### Production Checklist
- [ ] Storefront loads quickly on mobile.
- [ ] Products, categories, and promotions display correctly.
- [ ] Cart and checkout work without login.
- [ ] Admin login works.
- [ ] Staff permissions work.
- [ ] Manual payment tracking works.
- [ ] Receipts generate correctly.
- [ ] Emails send correctly.
- [ ] WhatsApp links open correctly.
- [ ] All env vars are set.
- [ ] SSL is active on the custom domain.
