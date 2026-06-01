# Claude Code — Build Prompt

Read the following files in order before doing anything:
1. `master_prompt.md` — Your tech stack rules, Prisma v7 patterns, and coding standards. Follow EXACTLY.
2. `design-style-guide.md` — The visual design system for this project. Apply to every component you build.
3. `jb-components.md` — The JB component reference. Use these components before writing from scratch.
4. `project-description.md` — What we are building. Every decision must align with this.
5. `project-phases.md` — The build plan. Work through phases in order.

## Rules
- Work through ONE phase at a time. Complete all tasks in a phase before moving to the next.
- After completing each phase, stop and confirm with me before proceeding.
- Follow design-style-guide.md tokens exactly: colors, typography, spacing, radius, cards, buttons, forms, product UI, and dashboard UI.
- Use Prisma v7 patterns only. Do NOT use Prisma v6 setup patterns.
- Use React Query for all client data fetching and Redis for API-layer caching through `getCachedOrFetch()` and `invalidateTag()` from `lib/cache.ts`.
- Never use `useEffect` for ordinary data fetching.
- Use React Hook Form + Zod for all forms.
- Use API Routes / Route Handlers for all server-side logic.
- Use Framer Motion for animation. Keep animations subtle and transform/opacity only.
- Use @react-pdf/renderer for receipt PDF generation. Never use jsPDF.
- Use xlsx for Excel export.
- Prices must always display in Namibian dollars, for example `N$ 4,500`.
- There is NO online payment in v1. Do not build Stripe, DGateway, PayPal, PayToday, or checkout payment gateway flows.
- Customers must be able to checkout without registering.
- WhatsApp and direct call must be prominent across the storefront.
- Dark mode is NOT supported. Do not install next-themes, do not create ThemeProvider, and do not add dark mode classes.
- Staff users must not access financial records unless explicitly granted by Admin.
- Use Cloudflare R2 for product images, promotion banners, and receipt PDFs.
- Follow performance budget: dynamic imports for heavy components, Suspense boundaries on every data-fetching section, ErrorBoundary on major page blocks, aspect-ratio on all images, and no layout shift.
- Before building auth, file uploads, cart, data tables, or dashboard components from scratch, check `jb-components.md` and install the relevant JB component first.

## Business Context
Build Desert Technology Consultant, a Namibia-based technology retail and services platform. The business sells new, pre-used, and refurbished technology products including Apple products, Windows laptops, gaming PCs, desktops, CCTV/security devices, networking solutions, POS systems, accessories, promotions, and auto/mechanical services.

The main customer workflow is WhatsApp-first. Customers browse products, add items to cart, submit checkout details, and Desert Technology contacts them to confirm payment and collection/delivery. Admins manage the operational side: products, inventory, categories, promotions, orders, follow-ups, manual payments, receipts, notifications, staff, and customer records.

## Start
Begin with **Phase 1 — Foundation** from `project-phases.md`. Read the phase tasks and execute them in order.
