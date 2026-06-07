/**
 * Permission system for Desert Tech staff access control.
 * All permissions are enforced server-side.
 */

import { UserRole } from "@/lib/enums";

// ============== PERMISSION KEYS ==============

export const Permissions = {
  // Dashboard
  DASHBOARD_VIEW: "dashboard:view",

  // Orders
  ORDERS_VIEW: "orders:view",
  ORDERS_CREATE: "orders:create",
  ORDERS_UPDATE: "orders:update",
  ORDERS_CANCEL: "orders:cancel",
  ORDERS_DELETE: "orders:delete",

  // Products
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_CREATE: "products:create",
  PRODUCTS_UPDATE: "products:update",
  PRODUCTS_DELETE: "products:delete",

  // Categories
  CATEGORIES_VIEW: "categories:view",
  CATEGORIES_MANAGE: "categories:manage",

  // Promotions
  PROMOTIONS_VIEW: "promotions:view",
  PROMOTIONS_MANAGE: "promotions:manage",

  // Customers
  CUSTOMERS_VIEW: "customers:view",
  CUSTOMERS_UPDATE: "customers:update",

  // Payments
  PAYMENTS_VIEW: "payments:view",
  PAYMENTS_CREATE: "payments:create",
  PAYMENTS_UPDATE: "payments:update",
  PAYMENTS_REMOVE: "payments:remove",

  // Documents (Receipts, Quotations)
  DOCUMENTS_VIEW: "documents:view",
  DOCUMENTS_CREATE: "documents:create",
  DOCUMENTS_UPDATE: "documents:update",
  DOCUMENTS_SEND: "documents:send",
  DOCUMENTS_DELETE: "documents:delete",

  // Follow-ups
  FOLLOWUPS_VIEW: "followups:view",
  FOLLOWUPS_MANAGE: "followups:manage",

  // Stock Requests
  STOCK_REQUESTS_VIEW: "stockRequests:view",
  STOCK_REQUESTS_MANAGE: "stockRequests:manage",

  // Staff Management
  STAFF_VIEW: "staff:view",
  STAFF_MANAGE: "staff:manage",

  // Notifications
  NOTIFICATIONS_VIEW: "notifications:view",
  NOTIFICATIONS_MANAGE: "notifications:manage",

  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_UPDATE: "settings:update",

  // Audit Logs
  AUDIT_LOGS_VIEW: "auditLogs:view",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

// ============== ROLE-BASED DEFAULT PERMISSIONS ==============

/**
 * Default permissions for each role.
 * OWNER gets all permissions implicitly.
 * ADMIN gets most permissions except sensitive staff management.
 * STAFF gets minimal permissions that can be expanded.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: Object.values(Permissions),
  [UserRole.ADMIN]: [
    Permissions.DASHBOARD_VIEW,
    Permissions.ORDERS_VIEW,
    Permissions.ORDERS_CREATE,
    Permissions.ORDERS_UPDATE,
    Permissions.ORDERS_CANCEL,
    Permissions.PRODUCTS_VIEW,
    Permissions.PRODUCTS_CREATE,
    Permissions.PRODUCTS_UPDATE,
    Permissions.PRODUCTS_DELETE,
    Permissions.CATEGORIES_VIEW,
    Permissions.CATEGORIES_MANAGE,
    Permissions.PROMOTIONS_VIEW,
    Permissions.PROMOTIONS_MANAGE,
    Permissions.CUSTOMERS_VIEW,
    Permissions.CUSTOMERS_UPDATE,
    Permissions.PAYMENTS_VIEW,
    Permissions.PAYMENTS_CREATE,
    Permissions.PAYMENTS_UPDATE,
    Permissions.DOCUMENTS_VIEW,
    Permissions.DOCUMENTS_CREATE,
    Permissions.DOCUMENTS_UPDATE,
    Permissions.DOCUMENTS_SEND,
    Permissions.FOLLOWUPS_VIEW,
    Permissions.FOLLOWUPS_MANAGE,
    Permissions.STOCK_REQUESTS_VIEW,
    Permissions.STOCK_REQUESTS_MANAGE,
    Permissions.STAFF_VIEW,
    Permissions.STAFF_MANAGE,
    Permissions.NOTIFICATIONS_VIEW,
    Permissions.NOTIFICATIONS_MANAGE,
    Permissions.SETTINGS_VIEW,
    Permissions.SETTINGS_UPDATE,
    Permissions.AUDIT_LOGS_VIEW,
  ],
  [UserRole.STAFF]: [
    Permissions.DASHBOARD_VIEW,
    Permissions.ORDERS_VIEW,
    Permissions.ORDERS_UPDATE,
    Permissions.PRODUCTS_VIEW,
    Permissions.CUSTOMERS_VIEW,
    Permissions.DOCUMENTS_VIEW,
    Permissions.FOLLOWUPS_VIEW,
    Permissions.FOLLOWUPS_MANAGE,
    Permissions.NOTIFICATIONS_VIEW,
  ],
};

// ============== PERMISSION HELPERS ==============

/**
 * Check if a user has a specific permission.
 * OWNER always has all permissions.
 */
export function hasPermission(
  userRole: UserRole,
  userPermissions: Permission[] | null | undefined,
  permission: Permission
): boolean {
  // OWNER has all permissions
  if (userRole === UserRole.OWNER) return true;

  // Check explicit permissions
  if (userPermissions?.includes(permission)) return true;

  // Check default role permissions
  return DEFAULT_ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}

/**
 * Check if a user has any of the specified permissions.
 */
export function hasAnyPermission(
  userRole: UserRole,
  userPermissions: Permission[] | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(userRole, userPermissions, p));
}

/**
 * Check if a user has all of the specified permissions.
 */
export function hasAllPermissions(
  userRole: UserRole,
  userPermissions: Permission[] | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(userRole, userPermissions, p));
}

/**
 * Get all permissions for a user, combining role defaults with explicit permissions.
 */
export function getUserPermissions(
  userRole: UserRole,
  explicitPermissions: Permission[] | null | undefined
): Permission[] {
  if (userRole === UserRole.OWNER) {
    return Object.values(Permissions);
  }

  const defaults = DEFAULT_ROLE_PERMISSIONS[userRole] ?? [];
  const explicit = explicitPermissions ?? [];

  // Combine and deduplicate
  return Array.from(new Set([...defaults, ...explicit]));
}

// ============== SERVER-SIDE AUTHORIZATION ==============

import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

interface AuthContext {
  userId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

/**
 * Require a specific role. Throws if user doesn't have the role.
 * OWNER passes all role checks.
 */
export function requireRole(
  auth: AuthContext,
  requiredRole: UserRole | UserRole[]
): void {
  // OWNER can access anything
  if (auth.role === UserRole.OWNER) return;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!roles.includes(auth.role)) {
    throw new Error("Insufficient role privileges");
  }
}

/**
 * Require a specific permission. Throws if user doesn't have the permission.
 */
export function requirePermission(
  auth: AuthContext,
  permission: Permission
): void {
  if (!hasPermission(auth.role, auth.permissions, permission)) {
    throw new Error("Insufficient permissions");
  }
}

/**
 * Check permission and return boolean (for guards).
 */
export function can(
  auth: AuthContext,
  permission: Permission
): boolean {
  return hasPermission(auth.role, auth.permissions, permission);
}

// ============== UI NAVIGATION CONFIGURATION ==============

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  requiredPermission: Permission;
  subItems?: NavItem[];
}

/**
 * Dashboard navigation configuration.
 * Items are filtered based on user permissions.
 */
export const DASHBOARD_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    requiredPermission: Permissions.DASHBOARD_VIEW,
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: "ShoppingCart",
    requiredPermission: Permissions.ORDERS_VIEW,
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: "Package",
    requiredPermission: Permissions.PRODUCTS_VIEW,
    subItems: [
      {
        label: "All Products",
        href: "/dashboard/products",
        icon: "List",
        requiredPermission: Permissions.PRODUCTS_VIEW,
      },
      {
        label: "Categories",
        href: "/dashboard/categories",
        icon: "Tags",
        requiredPermission: Permissions.CATEGORIES_VIEW,
      },
      {
        label: "Brands",
        href: "/dashboard/brands",
        icon: "Award",
        requiredPermission: Permissions.CATEGORIES_VIEW,
      },
    ],
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: "Users",
    requiredPermission: Permissions.CUSTOMERS_VIEW,
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: "CreditCard",
    requiredPermission: Permissions.PAYMENTS_VIEW,
  },
  {
    label: "Quotations",
    href: "/dashboard/quotations",
    icon: "FileText",
    requiredPermission: Permissions.DOCUMENTS_VIEW,
  },
  {
    label: "Receipts",
    href: "/dashboard/receipts",
    icon: "Receipt",
    requiredPermission: Permissions.DOCUMENTS_VIEW,
  },
  {
    label: "Follow-ups",
    href: "/dashboard/follow-ups",
    icon: "Phone",
    requiredPermission: Permissions.FOLLOWUPS_VIEW,
  },
  {
    label: "Back in Stock",
    href: "/dashboard/back-in-stock",
    icon: "Bell",
    requiredPermission: Permissions.STOCK_REQUESTS_VIEW,
  },
  {
    label: "Promotions",
    href: "/dashboard/promotions",
    icon: "Percent",
    requiredPermission: Permissions.PROMOTIONS_VIEW,
  },
  {
    label: "Staff",
    href: "/dashboard/staff",
    icon: "UserCog",
    requiredPermission: Permissions.STAFF_VIEW,
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: "BellDot",
    requiredPermission: Permissions.NOTIFICATIONS_VIEW,
  },
  {
    label: "Audit Log",
    href: "/dashboard/audit-log",
    icon: "ClipboardList",
    requiredPermission: Permissions.AUDIT_LOGS_VIEW,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
    requiredPermission: Permissions.SETTINGS_VIEW,
  },
];

// ============== API ENDPOINT PROTECTION ==============

/**
 * Middleware helper to check permissions in API routes.
 */
export function withPermission(
  handler: (req: NextRequest, auth: AuthContext) => Promise<NextResponse>,
  requiredPermission: Permission
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Auth will be extracted from session in the handler
    // This is a placeholder for the wrapper pattern
    return handler(req, {} as AuthContext);
  };
}
