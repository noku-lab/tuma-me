// User roles matching backend enum
export const USER_ROLES = {
  RETAILER: 'retailer',
  WHOLESALER: 'wholesaler',
  ADMIN: 'admin',
  DELIVERY_AGENT: 'delivery_agent',
};

// Role display labels
export const ROLE_LABELS = {
  [USER_ROLES.RETAILER]: 'Retailer',
  [USER_ROLES.WHOLESALER]: 'Wholesaler',
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.DELIVERY_AGENT]: 'Delivery Agent',
};

// Default role (matches backend default)
export const DEFAULT_ROLE = USER_ROLES.RETAILER;

// All roles as array for easy iteration
export const ALL_ROLES = Object.values(USER_ROLES);
