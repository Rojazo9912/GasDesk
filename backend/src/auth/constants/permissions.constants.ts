import { Rol } from '@prisma/client';

export enum Permission {
  // Solicitudes
  CREATE_SC = 'create_sc',
  VIEW_SC = 'view_sc',
  EDIT_SC = 'edit_sc',
  DELETE_SC = 'delete_sc',
  APPROVE_SC = 'approve_sc',
  
  // Órdenes
  CREATE_OC = 'create_oc',
  VIEW_OC = 'view_oc',
  EDIT_OC = 'edit_oc',
  DELETE_OC = 'delete_oc',
  
  // Catálogos
  MANAGE_SUPPLIERS = 'manage_suppliers',
  MANAGE_PRODUCTS = 'manage_products',
  MANAGE_PRICES = 'manage_prices',
  
  // Inventario
  VIEW_INVENTORY = 'view_inventory',
  MANAGE_INVENTORY = 'manage_inventory',
  
  // Reportes
  VIEW_REPORTS = 'view_reports',
  
  // Auditoría
  VIEW_AUDIT = 'view_audit',
  
  // Administración
  MANAGE_USERS = 'manage_users',
  MANAGE_TENANTS = 'manage_tenants',

  // Presupuestos
  VIEW_BUDGETS = 'view_budgets',
  MANAGE_BUDGETS = 'manage_budgets',
}

export const ROLE_PERMISSIONS: Record<Rol, Permission[]> = {
  [Rol.SUPER_ADMIN]: Object.values(Permission),
  [Rol.ADMIN]: Object.values(Permission),
  
  [Rol.SOLICITANTE]: [
    Permission.CREATE_SC, 
    Permission.VIEW_SC, 
    Permission.VIEW_INVENTORY
  ],
  
  [Rol.GERENTE]: [
    Permission.VIEW_SC,
    Permission.APPROVE_SC,
    Permission.VIEW_OC,
    Permission.VIEW_REPORTS,
    Permission.VIEW_INVENTORY,
    Permission.VIEW_BUDGETS
  ],
  
  [Rol.COMPRAS]: [
    Permission.VIEW_SC,
    Permission.CREATE_OC,
    Permission.VIEW_OC,
    Permission.MANAGE_SUPPLIERS,
    Permission.MANAGE_PRICES,
    Permission.VIEW_REPORTS
  ],
  
  [Rol.CONTRALOR]: [
    Permission.VIEW_SC,
    Permission.VIEW_OC,
    Permission.VIEW_REPORTS,
    Permission.VIEW_AUDIT,
    Permission.VIEW_INVENTORY,
    Permission.VIEW_BUDGETS
  ],
  
  [Rol.ALMACENISTA]: [
    Permission.VIEW_OC,
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_INVENTORY
  ],
};
