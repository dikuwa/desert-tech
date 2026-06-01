# Desert Technology Consultant — Design Style Guide

Dark mode: NOT supported in this project. Do not add `.dark` classes, next-themes, ThemeProvider, dark palettes, or dark mode toggles.

## Visual reference
The visual direction is based on two minimalist ecommerce references: clean product grids, large white space, soft grey product image panels, compact category/filter sidebars, small rounded buttons, subtle borders, and a professional retail dashboard feel. The first reference uses bold black-and-white retail styling with compact black CTAs. The second reference uses a clean ecommerce admin/catalog feel with rounded product cards, light grey backgrounds, clear filters, small badges, and a vivid accent color. Desert Technology should merge these into a modern Namibian tech store: white surfaces, light grey panels, black text, orange brand CTAs, and WhatsApp/call actions that are more prominent than online payment actions.

## 1. Brand Personality
Desert Technology Consultant should feel practical, trustworthy, modern, and sales-focused. The design must avoid flashy gradients and overly playful visuals. It should look like a professional electronics and technology store that customers can trust for both gadgets and technical services.

**Design keywords:** clean, technical, minimal, direct, confident, retail-first, WhatsApp-friendly.

## 2. Color System
Use a light-only design system.

### Core Colors
- **Primary Orange:** `#f68923` — main CTAs, active states, highlights, important badges.
- **Primary Orange Hover:** `#dd781c` — hover state for orange buttons.
- **Primary Orange Soft:** `#fff3e8` — light background for featured badges and callouts.
- **Black:** `#111111` — primary text and secondary CTAs.
- **Near Black:** `#1b1b1b` — hero text, footer panels, strong headings.
- **White:** `#ffffff` — main background and cards.
- **Page Background:** `#f7f7f7` — product image panels and alternate sections.
- **Muted Surface:** `#f2f2f2` — filter chips, skeletons, subtle panels.
- **Border:** `#e8e8e8` — card, sidebar, input, table borders.
- **Muted Text:** `#6f6f6f` — supporting text.
- **Light Text:** `#9a9a9a` — metadata, helper text, labels.

### Semantic Colors
- **Success:** `#16a34a`
- **Success Soft:** `#ecfdf3`
- **Warning:** `#f59e0b`
- **Warning Soft:** `#fffbeb`
- **Error:** `#dc2626`
- **Error Soft:** `#fef2f2`
- **Info:** `#2563eb`
- **Info Soft:** `#eff6ff`
- **WhatsApp:** `#25D366`
- **WhatsApp Hover:** `#1ebe5d`

### Tailwind v4 Theme Tokens
```css
@theme {
  --color-background: #ffffff;
  --color-foreground: #111111;
  --color-card: #ffffff;
  --color-card-foreground: #111111;
  --color-popover: #ffffff;
  --color-popover-foreground: #111111;
  --color-primary: #f68923;
  --color-primary-foreground: #ffffff;
  --color-secondary: #111111;
  --color-secondary-foreground: #ffffff;
  --color-muted: #f7f7f7;
  --color-muted-foreground: #6f6f6f;
  --color-accent: #fff3e8;
  --color-accent-foreground: #111111;
  --color-destructive: #dc2626;
  --color-destructive-foreground: #ffffff;
  --color-border: #e8e8e8;
  --color-input: #e8e8e8;
  --color-ring: #f68923;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 14px;
}
```

## 3. Typography
Use **Inter** throughout the project.

### Font Rules
- **Headings:** Inter, 700 or 800, tight tracking, strong black.
- **Subheadings:** Inter, 600 or 700.
- **Body:** Inter, 400 or 500.
- **Labels:** Inter, 500 or 600, compact.
- **Prices:** Inter, 700, black.
- **Buttons:** Inter, 600, compact text.

### Type Scale
- **Hero heading:** 64–96px desktop, 44–56px tablet, 36–44px mobile.
- **Page heading:** 32–44px desktop, 28–34px mobile.
- **Section heading:** 28–36px desktop, 24–30px mobile.
- **Card title:** 15–17px.
- **Body:** 14–16px.
- **Metadata:** 12–13px.
- **Button text:** 13–14px.

### Copy Style
Use short, practical, customer-first language. Avoid heavy technical jargon.

Examples:
- “Browse new and pre-used tech.”
- “Need help choosing? WhatsApp us.”
- “Submit your order request. We’ll contact you to confirm.”
- “No online payment required.”

## 4. Layout & Spacing
Use generous whitespace like the references, but keep product cards compact and scannable.

### Page Widths
- **Storefront max width:** `1280px`
- **Dashboard max width:** full width with 24px page padding.
- **Product grid container:** `1180px–1280px`
- **Content sections:** 72–96px vertical spacing desktop, 48–64px mobile.

### Grid Rules
- **Desktop product grid:** 3–4 columns depending on sidebar presence.
- **Tablet product grid:** 2 columns.
- **Mobile product grid:** 1–2 columns depending on product card density.
- **Dashboard tables:** full width with sticky filters where useful.

### Spacing Rhythm
Use an 8px spacing rhythm.
- `4px` for tiny gaps.
- `8px` for icon/text spacing.
- `12px` for chip/button internal spacing.
- `16px` for card internal spacing.
- `24px` for card groups and grid gaps.
- `32px+` for major section separation.

## 5. Cards
Cards should match the clean ecommerce references.

### Product Cards
- Background: `#ffffff`
- Border: `1px solid #e8e8e8`
- Radius: `10px`
- Shadow: very subtle only on hover.
- Image area: soft grey `#f7f7f7`, radius `10px 10px 0 0` or full internal radius if image is inset.
- Padding: `14px–16px`
- Hover: slight translateY `-2px`, subtle shadow, border darkens to `#dddddd`.

### Dashboard Cards
- Background: `#ffffff`
- Border: `1px solid #e8e8e8`
- Radius: `10px`
- Padding: `20px–24px`
- Shadow: `0 1px 2px rgba(0,0,0,0.04)`

### Promotional Cards
- Background: black `#111111` or soft orange `#fff3e8` depending on emphasis.
- Radius: `12px`
- Use orange CTA for primary action.
- Do not use gradients.

## 6. Buttons
Buttons must be compact, modern, and direct.

### Primary Button
Use for key CTAs such as “Shop Products”, “Submit Order”, “Save Product”, and “Generate Receipt”.
- Background: `#f68923`
- Text: white
- Radius: `8px`
- Padding: `10px 16px` small, `12px 20px` normal
- Font: Inter 600, 14px
- Hover: `#dd781c`

### Secondary Button
Use for “Buy Now”, “View Details”, admin secondary actions.
- Background: `#111111`
- Text: white
- Radius: `8px`
- Hover: `#2a2a2a`

### WhatsApp Button
Use prominently across product pages, cart, checkout success, and sticky mobile actions.
- Background: `#25D366`
- Text: white
- Icon: WhatsApp icon or message icon
- Radius: `8px`
- Label examples: “WhatsApp Us”, “Ask on WhatsApp”, “Send Order on WhatsApp”

### Outline Button
Use for filters, minor actions, and “Continue Shopping”.
- Background: white
- Border: `1px solid #e8e8e8`
- Text: `#111111`
- Radius: `8px`

### Destructive Button
Use only for delete/cancel actions.
- Background: `#dc2626`
- Text: white

## 7. Forms & Inputs
Forms must be clean and easy to complete on mobile.

### Input Style
- Height: `42px–46px`
- Border: `1px solid #e8e8e8`
- Radius: `8px`
- Background: `#ffffff`
- Focus ring: `2px #f68923` with soft outline.
- Placeholder: `#9a9a9a`

### Checkout Form Fields
- Full Name
- Phone Number
- WhatsApp Number
- Email optional
- Preferred Contact Method
- Collection / Delivery Notes

### Validation
- Use Zod validation.
- Phone and WhatsApp must support Namibia format.
- Error text uses `#dc2626`, 12–13px.

## 8. Navigation
### Storefront Header
- White background.
- Sticky top preferred.
- Thin bottom border `#e8e8e8`.
- Logo left, navigation center/left, search and cart right.
- WhatsApp and call actions must be visible on desktop.

### Mobile Navigation
- Bottom sticky WhatsApp/call CTA or floating action buttons.
- Cart icon must remain easy to access.
- Category filters should open in a sheet/drawer.

### Dashboard Sidebar
- White sidebar with border-right `#e8e8e8`.
- Active nav item uses soft orange background `#fff3e8` and orange text.
- Use compact icons and labels.
- Financial navigation hidden from Staff users.

## 9. Product UI
### Price Format
All prices must use Namibian dollars:
- `N$ 4,500`
- `N$ 12,999`
- `N$ 850`

Do not use USD symbols anywhere.

### Product Badges
- **New:** soft green background.
- **Refurbished:** soft blue background.
- **Pre-Owned:** soft orange background.
- **On Request:** soft grey background.
- **Hot Promo:** orange background with white text.
- **Low Stock:** warning background.
- **Out of Stock:** muted grey background.

### Product Card Required Elements
- Product image
- Badge/condition
- Product name
- Brand/category
- Price
- Availability
- “Add to Cart” button
- “WhatsApp” or “View” action

## 10. Status Badges
### Order Statuses
- **Pending Contact:** warning soft
- **Contacted:** info soft
- **Awaiting Payment:** orange soft
- **Deposit Paid:** blue soft
- **Paid:** success soft
- **Ready for Collection:** purple/neutral soft
- **Completed:** success soft
- **Cancelled:** error soft

### Payment Statuses
- **Unpaid:** warning soft
- **Deposit Paid:** info soft
- **Paid:** success soft
- **Refunded:** muted soft
- **Cancelled:** error soft

### Follow-up Statuses
- **Pending:** warning soft
- **Done:** success soft
- **Missed:** error soft

## 11. Dashboard Design
The dashboard must feel operational and efficient, not decorative.

### Dashboard Overview
Use stat cards for:
- New Orders
- Pending Follow-ups
- Low Stock
- Paid Orders
- Unpaid Orders
- New Messages

### Tables
- Use JB Data Table.
- Row height: compact but readable.
- Filters at top.
- Search always visible.
- Status badges in table rows.
- Row action menu for view/edit/update.

### Order Detail Page
Use a two-column desktop layout:
- Left: order items, customer details, timeline.
- Right: payment status, contact actions, receipt actions, follow-up panel.

## 12. Landing Page Guidance
### Hero Section
The hero should communicate the store quickly:
- “New, Pre-Owned & Refurbished Tech in Namibia”
- “Security, Networking, POS & Gadgets — WhatsApp us to order.”

Hero CTAs:
- Primary: “Shop Products”
- WhatsApp: “WhatsApp Us”
- Secondary: “Call Now”

### Homepage Sections
1. Hero with bold headline and product/search focus.
2. Category tiles.
3. Featured promotions.
4. Featured products.
5. CCTV, Networking, POS, and Services block.
6. Why buy from Desert Technology.
7. WhatsApp/call CTA banner.
8. Footer with contact and banking details.

## 13. PDF Receipt Template Notes
Receipts must look official, simple, and printable.

### Receipt Requirements
- Desert Technology Consultant logo/name.
- Contact number and WhatsApp number.
- Receipt number.
- Order number.
- Date issued.
- Customer details.
- Product/service line items.
- Quantity, unit price, total.
- Payment method and payment status.
- Grand total in Namibia dollars.
- Banking details:
  - Desert TECHNOLOGIES
  - Standard Bank
  - Account Number: 60003162833
  - Branch Code: 082672
- Footer note: “Thank you for choosing Desert Technology.”

### Receipt Style
- White background.
- Black text.
- Orange accent lines.
- No gradients.
- Clear table structure.

## 14. Email Template Notes
Emails should be simple, transactional, and mobile-friendly.

### Email Types
- New order received notification to admin.
- Customer order acknowledgement.
- Receipt issued email.
- Contact form received notification.

### Email Style
- White background.
- Orange header accent.
- Clear order details.
- WhatsApp and call links.
- No marketing-heavy layout.

## 15. Motion & Interaction
Use subtle Framer Motion only.

### Allowed Motion
- Fade in.
- Slight slide up.
- Product card hover translateY `-2px`.
- Button hover scale max `1.01`.
- Drawer/sheet transitions.

### Avoid
- Heavy parallax.
- Large bouncing effects.
- Gradient animations.
- Scroll hijacking.
- Complex GSAP unless explicitly requested.

## 16. Accessibility & Responsiveness
### Accessibility
- All buttons must have visible focus states.
- Product images require alt text.
- Forms require labels.
- Error messages must be clear.
- Color alone must not communicate status.

### Responsiveness
- Mobile-first checkout.
- Product filters collapse into drawer on mobile.
- Sticky WhatsApp/call actions on mobile.
- Tables need responsive overflow or mobile cards.
- Product cards must preserve image aspect ratio.

### Performance
- Use `next/image` for product images.
- Use aspect-ratio boxes to prevent layout shift.
- Dynamically import heavy dashboard components.
- Use Suspense and ErrorBoundary around data-fetching sections.
- Use Redis caching for GET API routes.
