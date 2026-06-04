/** Activity action identifiers stored in ActivityLog.action */
export const ActivityAction = {
  USER_REGISTERED: "USER_REGISTERED",
  ORDER_PLACED: "ORDER_PLACED",
  PRODUCT_CREATED: "PRODUCT_CREATED",
  PRODUCT_UPDATED: "PRODUCT_UPDATED",
  PRODUCT_DELETED: "PRODUCT_DELETED",
  INVENTORY_UPDATED: "INVENTORY_UPDATED",
  ORDER_STATUS_CHANGED: "ORDER_STATUS_CHANGED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  USER_PROMOTED: "USER_PROMOTED",
  USER_DEMOTED: "USER_DEMOTED",
  USER_BLOCKED: "USER_BLOCKED",
  USER_UNBLOCKED: "USER_UNBLOCKED",
  THEME_UPDATED: "THEME_UPDATED",
  BRANDING_UPDATED: "BRANDING_UPDATED",
  SETTINGS_UPDATED: "SETTINGS_UPDATED",
} as const;

export type ActivityActionType = (typeof ActivityAction)[keyof typeof ActivityAction];

export const ActivityEntityType = {
  USER: "USER",
  ORDER: "ORDER",
  PRODUCT: "PRODUCT",
  PRODUCT_VARIANT: "PRODUCT_VARIANT",
  SITE_SETTINGS: "SITE_SETTINGS",
} as const;

export type ActivityEntityTypeValue =
  (typeof ActivityEntityType)[keyof typeof ActivityEntityType];

export const ACTIVITY_ACTION_LABELS: Record<ActivityActionType, string> = {
  USER_REGISTERED: "User registered",
  ORDER_PLACED: "Order placed",
  PRODUCT_CREATED: "Product created",
  PRODUCT_UPDATED: "Product updated",
  PRODUCT_DELETED: "Product deleted",
  INVENTORY_UPDATED: "Inventory updated",
  ORDER_STATUS_CHANGED: "Order status changed",
  ORDER_CANCELLED: "Order cancelled",
  USER_PROMOTED: "User promoted",
  USER_DEMOTED: "User demoted",
  USER_BLOCKED: "User blocked",
  USER_UNBLOCKED: "User unblocked",
  THEME_UPDATED: "Theme updated",
  BRANDING_UPDATED: "Branding updated",
  SETTINGS_UPDATED: "Settings updated",
};

export const ACTIVITY_ACTION_OPTIONS = Object.entries(ACTIVITY_ACTION_LABELS).map(
  ([value, label]) => ({ value: value as ActivityActionType, label }),
);
