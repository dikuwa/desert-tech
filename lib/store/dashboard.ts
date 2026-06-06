import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  mockOrders as initialOrders,
  mockProducts as initialProducts,
  mockCustomers as initialCustomers,
  mockCategories as initialCategories,
  mockPromotions as initialPromotions,
  mockStaff as initialStaff,
  mockFollowUps as initialFollowUps,
  mockNotifications as initialNotifications,
  mockBackInStockRequests as initialBackInStockRequests,
  mockPayments as initialPayments,
  mockQuotations as initialQuotations,
  storeSettings as initialSettings,
  defaultContactDetails,
  defaultBankDetails,
  defaultPaymentMethods,
} from "@/lib/dashboard-data";
import type {
  DashboardOrder,
  DashboardProduct,
  DashboardCustomer,
  DashboardCategory,
  DashboardPromotion,
  DashboardStaff,
  DashboardFollowUp,
  DashboardNotification,
  DashboardPayment,
  DashboardQuotation,
  DashboardBackInStockRequest,
  BackInStockStatus,
  BackInStockUrgency,
  BackInStockContactMethod,
  OrderContactStatus,
  BankDetail,
  ContactDetail,
  PaymentMethod,
} from "@/lib/dashboard-data";

let nextOrderId = 11;
let nextQuotationId = 1;
let nextProductId = 20;
let nextCategoryId = 10;
let nextPromotionId = 10;
let nextStaffId = 10;
let nextFollowUpId = 10;
let nextNotificationId = 10;
let nextBackInStockId = 10;
let nextPaymentId = 10;
let nextContactDetailId = 10;
let nextBankDetailId = 10;
let nextPaymentMethodId = 10;
let nextInviteId = 10;

interface DashboardState {
  // Data
  orders: DashboardOrder[];
  products: DashboardProduct[];
  customers: DashboardCustomer[];
  categories: DashboardCategory[];
  promotions: DashboardPromotion[];
  staff: DashboardStaff[];
  followUps: DashboardFollowUp[];
  notifications: DashboardNotification[];
  quotations: DashboardQuotation[];
  payments: DashboardPayment[];
  contactDetails: ContactDetail[];
  bankDetails: BankDetail[];
  paymentMethods: PaymentMethod[];
  settings: typeof initialSettings;
  userRole: "Admin" | "Staff";
  currentUser: string;
  invites: { token: string; email: string; name: string; role: string; createdAt: string; usedAt?: string }[];

  // Products CRUD
  addProduct: (p: Omit<DashboardProduct, "id" | "createdAt" | "slug">) => void;
  updateProduct: (id: string, data: Partial<DashboardProduct>) => void;
  deleteProduct: (id: string) => void;

  // Categories CRUD
  addCategory: (c: Omit<DashboardCategory, "id" | "slug" | "productCount">) => void;
  updateCategory: (id: string, data: Partial<DashboardCategory>) => void;
  deleteCategory: (id: string) => void;
  reorderCategory: (id: string, newOrder: number) => void;
  toggleCategoryActive: (id: string) => void;

  // Promotions CRUD
  addPromotion: (p: Omit<DashboardPromotion, "id" | "slug" | "productCount">) => void;
  updatePromotion: (id: string, data: Partial<DashboardPromotion>) => void;
  deletePromotion: (id: string) => void;
  togglePromotionActive: (id: string) => void;

  // Orders
  addOrder: (o: {
    customerName: string;
    customerPhone: string;
    preferredContact: string;
    itemCount: number;
    subtotalCents: number;
    payment?: { amountCents: number; method: string; note?: string };
  }) => DashboardOrder;
  updateOrderContactStatus: (id: string, contactStatus: OrderContactStatus) => void;
  updateOrderPaymentStatus: (id: string, paymentStatus: string) => void;
  updateOrderFulfillmentStatus: (id: string, fulfillmentStatus: string) => void;
  resetOrderStatuses: (id: string) => void;
  deleteOrder: (id: string) => void;
  addPayment: (p: Omit<DashboardPayment, "id" | "recordedAt">) => void;
  addNotification: (n: Omit<DashboardNotification, "id" | "createdAt" | "isRead">) => void;

  // Follow-ups
  addFollowUp: (f: Omit<DashboardFollowUp, "id" | "createdAt">) => void;
  markFollowUpDone: (id: string) => void;

  // Staff
  addStaff: (s: Omit<DashboardStaff, "id" | "createdAt">) => void;
  updateStaff: (id: string, data: Partial<DashboardStaff>) => void;
  toggleStaffActive: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;

  // Settings
  updateSettings: (data: Partial<typeof initialSettings>) => void;

  // Contact Details CRUD
  addContactDetail: (c: Omit<ContactDetail, "id">) => void;
  updateContactDetail: (id: string, data: Partial<ContactDetail>) => void;
  deleteContactDetail: (id: string) => void;

  // Bank Details CRUD
  addBankDetail: (b: Omit<BankDetail, "id">) => void;
  updateBankDetail: (id: string, data: Partial<BankDetail>) => void;
  deleteBankDetail: (id: string) => void;

  // Payment Methods CRUD
  addPaymentMethod: (p: Omit<PaymentMethod, "id">) => void;
  updatePaymentMethod: (id: string, data: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (id: string) => void;
  movePaymentMethod: (id: string, direction: "up" | "down") => void;
  moveContactDetail: (id: string, direction: "up" | "down") => void;
  moveBankDetail: (id: string, direction: "up" | "down") => void;

  // Staff
  updateStaffRole: (id: string, role: string) => void;

  // Invites
  addInvite: (invite: { token: string; email: string; name: string; role: string; createdAt: string }) => void;
  markInviteUsed: (token: string) => void;

  // Back-In-Stock Requests
  backInStockRequests: DashboardBackInStockRequest[];
  addBackInStockRequest: (r: Omit<DashboardBackInStockRequest, "id" | "createdAt" | "updatedAt" | "status">) => void;
  updateBackInStockStatus: (id: string, status: BackInStockStatus) => void;
  deleteBackInStockRequest: (id: string) => void;
  markBackInStockReadyForProduct: (productId: string, productName: string) => void;

  // Quotations
  addQuotation: (q: {
    customerName: string;
    customerPhone: string;
    preferredContact: string;
    items: { name: string; quantity: number; unitPriceCents: number }[];
    subtotalCents: number;
    notes?: string;
  }) => DashboardQuotation;
  updateQuotationStatus: (id: string, status: DashboardQuotation["status"]) => void;
  deleteQuotation: (id: string) => void;

  // Customers
  addCustomer: (c: Omit<DashboardCustomer, "id" | "createdAt" | "orderCount" | "totalSpentCents">) => void;
  updateCustomer: (id: string, data: Partial<DashboardCustomer>) => void;
  deleteCustomer: (id: string) => void;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function syncContactSettings(
  details: ContactDetail[],
  settings: typeof initialSettings,
): typeof initialSettings {
  const firstActive = (type: ContactDetail["type"]) =>
    details.find((cd) => cd.type === type && cd.isActive);
  const phone = firstActive("phone");
  const whatsapp = firstActive("whatsapp");
  const email = firstActive("email");
  const address = firstActive("address");
  return {
    ...settings,
    phone: phone?.value ?? settings.phone,
    whatsapp: whatsapp?.value ?? settings.whatsapp,
    email: email?.value ?? settings.email,
    address: address?.value ?? settings.address,
  };
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({

      orders: initialOrders,
      products: initialProducts,
      customers: initialCustomers,
      categories: initialCategories,
      promotions: initialPromotions,
      staff: initialStaff,
      followUps: initialFollowUps,
      notifications: initialNotifications,
      quotations: initialQuotations,
      payments: initialPayments,
      contactDetails: defaultContactDetails,
      bankDetails: defaultBankDetails,
      paymentMethods: defaultPaymentMethods,
      settings: initialSettings,
      backInStockRequests: initialBackInStockRequests,
      userRole: "Admin",
      currentUser: "Admin User",
      invites: [],

      // === Settings ===
      updateSettings: (data) =>
        set((s) => {
          const updatedSettings = { ...s.settings, ...data };
          // Sync settings fields back to contact details if they changed
          const fieldToContactType: Record<string, ContactDetail["type"]> = {
            phone: "phone",
            whatsapp: "whatsapp",
            email: "email",
            address: "address",
          };
          let updatedDetails = [...s.contactDetails];
          for (const [field, contactType] of Object.entries(fieldToContactType)) {
            if (field in data) {
              const existing = updatedDetails.find((cd) => cd.type === contactType);
              if (existing) {
                const val = data[field as keyof typeof data];
                updatedDetails = updatedDetails.map((cd) =>
                  cd.id === existing.id ? { ...cd, value: val != null ? String(val) : "" } : cd,
                );
              }
            }
          }
          return { settings: updatedSettings, contactDetails: updatedDetails };
        }),

      // === Contact Details ===
      moveContactDetail: (id, direction) =>
        set((s) => {
          const idx = s.contactDetails.findIndex((cd) => cd.id === id);
          if (idx === -1) return s;
          const newIdx = direction === "up" ? idx - 1 : idx + 1;
          if (newIdx < 0 || newIdx >= s.contactDetails.length) return s;
          const items = [...s.contactDetails];
          [items[idx], items[newIdx]] = [items[newIdx], items[idx]];
          return { contactDetails: items };
        }),
      addContactDetail: (c) => {
        const id = `cd${nextContactDetailId++}`;
        set((s) => {
          const newDetails = [...s.contactDetails, { ...c, id }];
          return { contactDetails: newDetails, settings: syncContactSettings(newDetails, s.settings) };
        });
      },
      updateContactDetail: (id, data) =>
        set((s) => {
          const newDetails = s.contactDetails.map((cd) =>
            cd.id === id ? { ...cd, ...data } : cd
          );
          return { contactDetails: newDetails, settings: syncContactSettings(newDetails, s.settings) };
        }),
      deleteContactDetail: (id) =>
        set((s) => {
          const newDetails = s.contactDetails.filter((cd) => cd.id !== id);
          return { contactDetails: newDetails, settings: syncContactSettings(newDetails, s.settings) };
        }),

      // === Bank Details ===
      moveBankDetail: (id, direction) =>
        set((s) => {
          const idx = s.bankDetails.findIndex((bd) => bd.id === id);
          if (idx === -1) return s;
          const newIdx = direction === "up" ? idx - 1 : idx + 1;
          if (newIdx < 0 || newIdx >= s.bankDetails.length) return s;
          const items = [...s.bankDetails];
          [items[idx], items[newIdx]] = [items[newIdx], items[idx]];
          return { bankDetails: items };
        }),
      addBankDetail: (b) => {
        const id = `bd${nextBankDetailId++}`;
        set((s) => ({
          bankDetails: [...s.bankDetails, { ...b, id }],
        }));
      },
      updateBankDetail: (id, data) =>
        set((s) => ({
          bankDetails: s.bankDetails.map((bd) =>
            bd.id === id ? { ...bd, ...data } : bd
          ),
        })),
      deleteBankDetail: (id) =>
        set((s) => ({
          bankDetails: s.bankDetails.filter((bd) => bd.id !== id),
        })),

      // === Payment Methods ===
      addPaymentMethod: (p) => {
        const id = `pm${nextPaymentMethodId++}`;
        set((s) => ({
          paymentMethods: [{ ...p, id }, ...s.paymentMethods],
        }));
      },
      movePaymentMethod: (id, direction) =>
        set((s) => {
          const idx = s.paymentMethods.findIndex((pm) => pm.id === id);
          if (idx === -1) return s;
          const newIdx = direction === "up" ? idx - 1 : idx + 1;
          if (newIdx < 0 || newIdx >= s.paymentMethods.length) return s;
          const items = [...s.paymentMethods];
          [items[idx], items[newIdx]] = [items[newIdx], items[idx]];
          return { paymentMethods: items };
        }),
      updatePaymentMethod: (id, data) =>
        set((s) => ({
          paymentMethods: s.paymentMethods.map((pm) =>
            pm.id === id ? { ...pm, ...data } : pm
          ),
        })),
      deletePaymentMethod: (id) =>
        set((s) => ({
          paymentMethods: s.paymentMethods.filter((pm) => pm.id !== id),
        })),

      // === Staff ===
      updateStaff: (id, data) =>
        set((s) => ({
          staff: s.staff.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),
      updateStaffRole: (id, role) =>
        set((s) => ({
          staff: s.staff.map((m) => (m.id === id ? { ...m, role } : m)),
        })),

      // === Invites ===
      addInvite: (invite) =>
        set((s) => ({
          invites: [invite, ...s.invites],
        })),
      markInviteUsed: (token) =>
        set((s) => ({
          invites: s.invites.map((i) =>
            i.token === token ? { ...i, usedAt: new Date().toISOString() } : i
          ),
        })),

      // === Products ===
      addProduct: (p) => {
        const id = `p${nextProductId++}`;
        const newProduct: DashboardProduct = {
          ...p,
          id,
          slug: slugify(p.name),
          createdAt: new Date().toISOString().split("T")[0],
        };
        set((s) => ({ products: [newProduct, ...s.products] }));
        // Update category product count
        set((s) => ({
          categories: s.categories.map((c) =>
            c.name === p.category ? { ...c, productCount: c.productCount + 1 } : c
          ),
        }));
      },
      updateProduct: (id, data) =>
        set((s) => {
          const oldProduct = s.products.find((p) => p.id === id);
          const wasOutOfStock =
            oldProduct?.availability === "OutOfStock" ||
            (oldProduct?.stockQuantity ?? 0) <= 0;
          const nowInStock =
            (data.availability === "InStock" || data.availability === "LowStock") ||
            (data.stockQuantity !== undefined && data.stockQuantity > 0);

          const result: Partial<DashboardState> = {
            products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
          };

          // Stock-return trigger: if product was out of stock and now has stock
          if (wasOutOfStock && nowInStock) {
            const productName = data.name || oldProduct?.name || "";
            const updatedRequests = s.backInStockRequests.map((r) =>
              r.productId === id && r.status === "New"
                ? { ...r, status: "ReadyToContact" as const, updatedAt: new Date().toISOString() }
                : r,
            );
            const changedCount = updatedRequests.filter(
              (r, i) =>
                r.status === "ReadyToContact" &&
                s.backInStockRequests[i]?.status === "New",
            ).length;

            if (changedCount > 0) {
              const newNotif: DashboardNotification = {
                id: `n${nextNotificationId++}`,
                type: "stock",
                title: "Stock Restored",
                message: `${changedCount} customer${changedCount > 1 ? "s" : ""} requested ${productName}. Stock is now available.`,
                isRead: false,
                createdAt: new Date().toISOString(),
              };
              result.notifications = [newNotif, ...s.notifications];
              result.backInStockRequests = updatedRequests;
            }
          }

          return result;
        }),
      deleteProduct: (id) =>
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
        })),

      // === Categories ===
      addCategory: (c) => {
        const id = `cat${nextCategoryId++}`;
        const newCat: DashboardCategory = {
          ...c,
          id,
          slug: slugify(c.name),
          productCount: 0,
        };
        set((s) => ({ categories: [...s.categories, newCat] }));
      },
      updateCategory: (id, data) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),
      reorderCategory: (id, newOrder) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, sortOrder: newOrder } : c
          ),
        })),
      toggleCategoryActive: (id) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive } : c
          ),
        })),

      // === Promotions ===
      addPromotion: (p) => {
        const id = `pr${nextPromotionId++}`;
        const newPromo: DashboardPromotion = {
          ...p,
          id,
          slug: slugify(p.title),
          productCount: 0,
        };
        set((s) => ({ promotions: [newPromo, ...s.promotions] }));
      },
      updatePromotion: (id, data) =>
        set((s) => ({
          promotions: s.promotions.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deletePromotion: (id) =>
        set((s) => ({
          promotions: s.promotions.filter((p) => p.id !== id),
        })),
      togglePromotionActive: (id) =>
        set((s) => ({
          promotions: s.promotions.map((p) =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
          ),
        })),

      // === Orders ===
      addOrder: (o) => {
        const id = `o${nextOrderId++}`;
        const orderNumber = `DT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const now = new Date().toISOString();
        const paymentStatus: DashboardOrder["paymentStatus"] = o.payment
          ? o.payment.amountCents >= o.subtotalCents
            ? "PaidInFull"
            : "DepositPaid"
          : "Unpaid";

        const newOrder: DashboardOrder = {
          id,
          orderNumber,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          itemCount: o.itemCount,
          subtotalCents: o.subtotalCents,
          contactStatus: "NotContacted",
          paymentStatus,
          fulfillmentStatus: "Pending",
          preferredContact: o.preferredContact,
          createdAt: now,
          updatedAt: now,
          paymentStatusAt: o.payment ? now : undefined,
        };

        set((s) => ({
          orders: [newOrder, ...s.orders],
        }));

        // Record payment if provided
        if (o.payment) {
          get().addPayment({
            orderNumber: newOrder.orderNumber,
            customerName: o.customerName,
            amountCents: o.payment.amountCents,
            method: o.payment.method,
            status: "Confirmed",
            note: o.payment.note,
          });
        }

        // Create notification
        get().addNotification({
          type: "order",
          title: o.payment ? "New Walk-in Order + Payment" : "New Walk-in Order",
          message: `${o.customerName} — ${newOrder.orderNumber}${o.payment ? ` — ${paymentStatus === "PaidInFull" ? "Paid in full" : "Deposit received"}` : ""}`,
        });

        return newOrder;
      },
      updateOrderContactStatus: (id, contactStatus) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? { ...o, contactStatus: contactStatus as DashboardOrder["contactStatus"], contactStatusAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : o
          ),
        })),
      updateOrderPaymentStatus: (id, paymentStatus) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? { ...o, paymentStatus: paymentStatus as DashboardOrder["paymentStatus"], paymentStatusAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : o
          ),
        })),
      updateOrderFulfillmentStatus: (id, fulfillmentStatus) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? { ...o, fulfillmentStatus: fulfillmentStatus as DashboardOrder["fulfillmentStatus"], fulfillmentStatusAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : o
          ),
        })),
      resetOrderStatuses: (id) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  contactStatus: "NotContacted" as const,
                  paymentStatus: "Unpaid" as const,
                  fulfillmentStatus: "Pending" as const,
                  contactStatusAt: undefined,
                  paymentStatusAt: undefined,
                  fulfillmentStatusAt: undefined,
                  updatedAt: new Date().toISOString(),
                }
              : o
          ),
        })),
      deleteOrder: (id) =>
        set((s) => {
          const order = s.orders.find((o) => o.id === id);
          return {
            orders: s.orders.filter((o) => o.id !== id),
            payments: order
              ? s.payments.filter((p) => p.orderNumber !== order.orderNumber)
              : s.payments,
          };
        }),
      addPayment: (p) => {
        const id = `pay${nextPaymentId++}`;
        const newPayment: DashboardPayment = {
          ...p,
          id,
          recordedAt: new Date().toISOString(),
        };
        set((s) => ({ payments: [newPayment, ...s.payments] }));
      },
      addNotification: (n) => {
        const id = `n${nextNotificationId++}`;
        const newNotif: DashboardNotification = {
          ...n,
          id,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ notifications: [newNotif, ...s.notifications] }));
      },

      // === Follow-ups ===
      addFollowUp: (f) => {
        const id = `f${nextFollowUpId++}`;
        set((s) => ({
          followUps: [
            { ...f, id, createdAt: new Date().toISOString() },
            ...s.followUps,
          ],
        }));
      },
      markFollowUpDone: (id) =>
        set((s) => ({
          followUps: s.followUps.map((f) =>
            f.id === id ? { ...f, status: "Done" } : f
          ),
        })),

      // === Staff ===
      addStaff: (s) => {
        const id = `s${nextStaffId++}`;
        set((state) => ({
          staff: [
            {
              ...s,
              id,
              createdAt: new Date().toISOString().split("T")[0],
            },
            ...state.staff,
          ],
        }));
      },
      toggleStaffActive: (id) =>
        set((s) => ({
          staff: s.staff.map((m) =>
            m.id === id ? { ...m, isActive: !m.isActive } : m
          ),
        })),

      // === Notifications ===
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
        })),
      deleteNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),

      // === Back-In-Stock Requests ===
      addBackInStockRequest: (r) => {
        const id = `bis${nextBackInStockId++}`;
        const now = new Date().toISOString();
        const newReq: DashboardBackInStockRequest = {
          ...r,
          id,
          status: "New",
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          backInStockRequests: [newReq, ...s.backInStockRequests],
        }));
        // Create dashboard notification
        get().addNotification({
          type: "backinstock",
          title: "New Stock Request",
          message: `${r.customerName} requested ${r.productName}`,
        });
      },
      updateBackInStockStatus: (id, status) =>
        set((s) => ({
          backInStockRequests: s.backInStockRequests.map((r) =>
            r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
          ),
        })),
      deleteBackInStockRequest: (id) =>
        set((s) => ({
          backInStockRequests: s.backInStockRequests.filter((r) => r.id !== id),
        })),
      markBackInStockReadyForProduct: (productId, productName) =>
        set((s) => {
          const now = new Date().toISOString();
          const updated = s.backInStockRequests.map((r) =>
            r.productId === productId && r.status === "New"
              ? { ...r, status: "ReadyToContact" as const, updatedAt: now }
              : r
          );
          const changedCount = updated.filter(
            (r, i) => r.status === "ReadyToContact" && s.backInStockRequests[i]?.status === "New"
          ).length;

          const result: Partial<DashboardState> = { backInStockRequests: updated };

          if (changedCount > 0) {
            const newNotif: DashboardNotification = {
              id: `n${nextNotificationId++}`,
              type: "stock",
              title: "Stock Restored",
              message: `${changedCount} customer${changedCount > 1 ? "s" : ""} requested ${productName}. Stock is now available.`,
              isRead: false,
              createdAt: new Date().toISOString(),
            };
            result.notifications = [newNotif, ...s.notifications];
          }

          return result;
        }),

      // === Quotations ===
      addQuotation: (q) => {
        const id = `qtn${nextQuotationId++}`;
        const quotationNumber = `QTN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const now = new Date().toISOString();
        const newQuotation: DashboardQuotation = {
          id,
          quotationNumber,
          customerName: q.customerName,
          customerPhone: q.customerPhone,
          preferredContact: q.preferredContact,
          items: q.items,
          subtotalCents: q.subtotalCents,
          notes: q.notes,
          status: "Draft",
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ quotations: [newQuotation, ...s.quotations] }));
        return newQuotation;
      },
      updateQuotationStatus: (id, status) =>
        set((s) => ({
          quotations: s.quotations.map((q) =>
            q.id === id
              ? { ...q, status, updatedAt: new Date().toISOString() }
              : q
          ),
        })),
      deleteQuotation: (id) =>
        set((s) => ({
          quotations: s.quotations.filter((q) => q.id !== id),
        })),

      // === Customers ===
      addCustomer: (c) => {
        set((s) => ({
          customers: [
            {
              ...c,
              id: `c${s.customers.length + 10}`,
              orderCount: 0,
              totalSpentCents: 0,
              createdAt: new Date().toISOString().split("T")[0],
            },
            ...s.customers,
          ],
        }));
      },
      updateCustomer: (id, data) =>
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),
      deleteCustomer: (id) =>
        set((s) => ({
          customers: s.customers.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "desert-tech-dashboard",
      version: 3,
    },
  ),
);

// Auto-sync across browser tabs when localStorage changes
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "desert-tech-dashboard") {
      useDashboardStore.persist.rehydrate();
    }
  });
}
