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
  mockPayments as initialPayments,
  storeSettings as initialSettings,
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
} from "@/lib/dashboard-data";

let nextProductId = 20;
let nextCategoryId = 10;
let nextPromotionId = 10;
let nextStaffId = 10;
let nextFollowUpId = 10;
let nextNotificationId = 10;
let nextPaymentId = 10;

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
  payments: DashboardPayment[];
  settings: typeof initialSettings;
  userRole: "Admin" | "Staff";
  currentUser: string;

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
  updateOrderStatus: (id: string, status: string) => void;
  updatePaymentStatus: (id: string, paymentStatus: string) => void;
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

  // Customers
  addCustomer: (c: Omit<DashboardCustomer, "id" | "createdAt" | "orderCount" | "totalSpentCents">) => void;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
      payments: initialPayments,
      settings: initialSettings,
      userRole: "Admin",
      currentUser: "Admin User",

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
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
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
      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
          ),
        })),
      updatePaymentStatus: (id, paymentStatus) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, paymentStatus, updatedAt: new Date().toISOString() } : o
          ),
        })),
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
      updateStaff: (id, data) =>
        set((s) => ({
          staff: s.staff.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),
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
    }),
    {
      name: "desert-tech-dashboard",
      version: 1,
    },
  ),
);
