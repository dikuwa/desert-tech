# Desert Technology Consultant — Project Description

## What This App Does
Desert Technology Consultant is a modern Namibia-based ecommerce and service enquiry platform for technology products, CCTV/security systems, networking solutions, POS systems, accessories, promotions, and auto/mechanical services. Customers can browse products, filter by category/brand/condition, add items to cart, and submit an order request without registering or paying online. Admins use the dashboard to manage products, categories, orders, follow-ups, manual payments, receipts, inventory, promotions, and staff permissions.

## Target Users
- **Primary user:** Namibian customers who want to browse new, pre-used, and refurbished technology products and contact the seller quickly through WhatsApp, phone, or email.
- **Secondary user:** Desert Technology admins and staff who need to manage products, customer enquiries, order follow-ups, receipts, payments, promotions, and inventory.

## Core Value Proposition
A WhatsApp-first technology store that makes it easy for customers to browse and request products while giving Desert Technology a structured admin system for sales follow-ups, receipts, and inventory control.

## User Roles & Permissions
- **Guest Customer:** Browse products, search/filter catalog, add products to cart, submit checkout details, choose preferred contact method, and contact Desert Technology via WhatsApp or phone.
- **Admin:** Full dashboard access including products, categories, promotions, orders, payments, receipts, customers, notifications, staff users, exports, and settings.
- **Staff:** Can view and update orders, manage follow-ups, contact customers, and update order status. Cannot view or edit financial records unless explicitly granted.

## Features — Complete List
1. **Landing Page** — Modern homepage with hero section, featured categories, promotions, WhatsApp/call CTAs, featured products, service blocks, and trust signals.
2. **Product Catalog** — Product grid with category sidebar, brand filters, condition filters, availability filters, search, sorting, pagination, and product cards.
3. **Product Detail Page** — Product images, price in Namibian dollars, condition, availability, warranty, specifications, category, quick WhatsApp enquiry, add-to-cart, and related products.
4. **Cart System** — Customers can add/remove products, update quantity, view total estimate, and continue to checkout without creating an account.
5. **Guest Checkout** — Customer enters full name, phone number, WhatsApp number, email, preferred contact method, collection/delivery notes, and submits order request.
6. **WhatsApp-First Contact Flow** — Sticky WhatsApp CTA, product-specific WhatsApp enquiry links, cart enquiry links, and mobile call CTA.
7. **Order Management Dashboard** — Admins see orders, customer details, cart items, payment status, follow-up status, contact preference, notes, and timeline.
8. **Manual Payment Tracking** — Admin can mark payment as unpaid, deposit paid, fully paid, refunded, or cancelled. No online payment processing.
9. **Receipt Generation** — Admin can generate PDF receipts using order and customer details, then send via email or WhatsApp manually.
10. **Customer Management** — Customer records are created from checkout submissions and linked to orders, receipts, notes, and follow-ups.
11. **Product Management** — Admin can add, edit, delete, archive, and publish products with images, pricing, stock, condition, category, brand, warranty, and specifications.
12. **Category Management** — Admin can create/edit/delete product categories including Apple Products, Windows Laptops, Gaming PCs, Desktop Computers, CCTV & Security, Networking, POS Systems, Accessories, Promotions, and Auto/Mechanical Services.
13. **Promotion Management** — Admin can create homepage banners, featured product groups, discount badges, and promotion sections.
14. **Inventory Management** — Track stock quantity, low-stock alerts, product availability, SKU, and condition.
15. **Notifications** — Dashboard notification center for new orders, low stock, pending follow-ups, payment updates, and new contact form submissions.
16. **Staff Management** — Admin can create staff accounts and assign restricted permissions.
17. **Search and Filtering** — Customers can search by product name, brand, category, SKU, condition, and service type.
18. **Exports** — Admin can export orders, products, receipts, and customers to Excel and PDF.
19. **Contact Form** — General enquiries from customers appear in the dashboard and can trigger email notification.
20. **Store Information Section** — Display contact number, WhatsApp number, banking details for reference, opening hours, and store/service location notes.

## Data Model
- **User:** id:string, name:string, email:string, passwordHash:string, role:enum(Admin, Staff), permissions:json, createdAt:datetime, updatedAt:datetime
- **Customer:** id:string, fullName:string, phone:string, whatsapp:string, email:string?, preferredContact:enum(WhatsApp, Phone, Email), notes:string?, createdAt:datetime, updatedAt:datetime
- **Category:** id:string, name:string, slug:string, description:string?, parentId:string?, sortOrder:number, isActive:boolean, createdAt:datetime, updatedAt:datetime
- **Product:** id:string, name:string, slug:string, sku:string?, brand:string?, categoryId:string, condition:enum(New, Refurbished, PreOwned, Service), description:string, specifications:json?, priceCents:number, compareAtPriceCents:number?, currency:string, stockQuantity:number, lowStockThreshold:number, availability:enum(InStock, LowStock, OutOfStock, OnRequest), warranty:string?, isFeatured:boolean, isPublished:boolean, createdAt:datetime, updatedAt:datetime
- **ProductImage:** id:string, productId:string, url:string, altText:string?, sortOrder:number, createdAt:datetime
- **Promotion:** id:string, title:string, slug:string, description:string?, bannerImageUrl:string?, discountLabel:string?, startsAt:datetime?, endsAt:datetime?, isActive:boolean, placement:enum(HomeHero, FeaturedSection, ProductBadge), createdAt:datetime, updatedAt:datetime
- **PromotionProduct:** id:string, promotionId:string, productId:string
- **Order:** id:string, orderNumber:string, customerId:string, status:enum(PendingContact, Contacted, AwaitingPayment, DepositPaid, Paid, ReadyForCollection, Completed, Cancelled), paymentStatus:enum(Unpaid, DepositPaid, Paid, Refunded, Cancelled), preferredContact:enum(WhatsApp, Phone, Email), subtotalCents:number, notes:string?, createdAt:datetime, updatedAt:datetime
- **OrderItem:** id:string, orderId:string, productId:string, productName:string, quantity:number, unitPriceCents:number, totalCents:number
- **PaymentRecord:** id:string, orderId:string, amountCents:number, method:enum(Cash, BankTransfer, PhoneTransfer, Other), status:enum(Pending, Confirmed, Failed, Refunded), recordedById:string, recordedAt:datetime, note:string?
- **Receipt:** id:string, orderId:string, receiptNumber:string, pdfUrl:string?, issuedById:string, issuedAt:datetime, sentVia:enum(Email, WhatsApp, Manual, NotSent), sentAt:datetime?
- **FollowUp:** id:string, orderId:string, assignedToId:string?, type:enum(Call, WhatsApp, Email, InternalNote), status:enum(Pending, Done, Missed), note:string, dueAt:datetime?, completedAt:datetime?, createdAt:datetime
- **Notification:** id:string, userId:string?, type:string, title:string, message:string, isRead:boolean, relatedEntityType:string?, relatedEntityId:string?, createdAt:datetime
- **ContactMessage:** id:string, fullName:string, phone:string?, whatsapp:string?, email:string?, subject:string?, message:string, status:enum(New, InProgress, Resolved), createdAt:datetime
- **Relationships:** A Product belongs to a Category. A Product has many ProductImages. A Promotion can contain many Products. A Customer has many Orders. An Order has many OrderItems, PaymentRecords, FollowUps, and Receipts. A User can record payments, issue receipts, and manage follow-ups.

## Pages / Screens
1. `/` — Landing page with hero, search, featured categories, promotions, featured products, service highlights, WhatsApp/call CTAs, and footer.
2. `/shop` — Product catalog with filters, search, sorting, pagination, and product cards.
3. `/shop/[slug]` — Product detail page with product information, gallery, price, add-to-cart, and WhatsApp enquiry.
4. `/cart` — Cart review page with quantities, totals, remove actions, and checkout CTA.
5. `/checkout` — Guest checkout form for customer contact details and preferred contact method.
6. `/order-success/[orderNumber]` — Order confirmation page showing next steps and WhatsApp/call CTA.
7. `/services` — Overview of CCTV, networking, POS, and auto/mechanical services.
8. `/promotions` — Active promotions and special offers.
9. `/contact` — Contact details, WhatsApp, call button, enquiry form, and banking details display.
10. `/login` — Admin/staff login page.
11. `/dashboard` — Admin overview with stats, recent orders, notifications, low stock, pending follow-ups, and quick actions.
12. `/dashboard/orders` — Orders table with filters, statuses, search, and exports.
13. `/dashboard/orders/[id]` — Order detail page with customer details, items, notes, payment tracking, follow-ups, and receipt actions.
14. `/dashboard/products` — Products table with search, filters, bulk actions, and exports.
15. `/dashboard/products/new` — Create product form.
16. `/dashboard/products/[id]/edit` — Edit product form.
17. `/dashboard/categories` — Category management.
18. `/dashboard/promotions` — Promotion management.
19. `/dashboard/customers` — Customer records and order history.
20. `/dashboard/receipts` — Receipt history with PDF links and resend status.
21. `/dashboard/payments` — Financial records visible only to Admin role.
22. `/dashboard/follow-ups` — Follow-up queue for orders and customer contact.
23. `/dashboard/notifications` — Notification center.
24. `/dashboard/staff` — Staff user management visible only to Admin role.
25. `/dashboard/settings` — Store settings, contact details, banking details, and notification preferences.

## Integrations
- **Auth:** Better Auth with email/password for Admin and Staff accounts only.
- **Email:** Resend for contact notifications, order alerts, and receipt emails.
- **Payments:** None. Manual payment tracking only. No Stripe or online checkout payment.
- **File uploads:** Cloudflare R2 for product images, promotion banners, and receipt PDFs.
- **PDF generation:** @react-pdf/renderer for receipts.
- **Excel export:** xlsx for products, orders, customers, payments, and receipts.
- **AI features:** None in v1.
- **Dark mode:** No — skip ThemeProvider and next-themes entirely.

## JB Components to Install
- **Form:** `pnpm dlx shadcn@latest add https://vibekit.desishub.com/r/form.json`
- **Better Auth UI:** `pnpm dlx shadcn@latest add https://better-auth-ui.desishub.com/r/auth-components.json`
- **Data Table:** `pnpm dlx shadcn@latest add https://jb.desishub.com/r/data-table.json`
- **Zustand Cart:** `pnpm dlx shadcn@latest add https://jb.desishub.com/r/zustand-cart.json`
- **File Storage UI:** `pnpm dlx shadcn@latest add https://file-storage.desishub.com/r/file-storage.json`

## Out of Scope (v1)
- Online card payments or payment gateways.
- Customer account registration and login.
- Vendor marketplace functionality.
- Subscriptions or recurring billing.
- Delivery tracking integrations.
- AI chatbot or AI product recommendations.
- Multi-branch inventory.
- Dark mode.
