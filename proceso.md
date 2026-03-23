# GasDesk — Proceso de Desarrollo

> Documento vivo para rastrear el avance del proyecto. Actualizar conforme se completan tareas.
> 
> **Leyenda:** ✅ Completado · 🔄 En progreso · ⏳ Pendiente · ❌ Bloqueado

---

## Semana 1 — Setup e Infraestructura

### Documentación y planeación
- ✅ `gasdesk-proyecto.md` — Documento de proyecto completo
- ✅ `proceso.md` — Este documento de seguimiento

### Backend — NestJS + Prisma
- ✅ Inicializar proyecto NestJS en `backend/`
- ✅ Instalar dependencias: Prisma, JWT, bcrypt, class-validator, Bull, Resend
- ✅ Configurar `.env` (DATABASE_URL, JWT_SECRET, Supabase, Resend, Redis)
- ✅ Crear schema Prisma (Tenant, User, Location, ApprovalFlow, etc.)
- ✅ Primera migración en Supabase (`prisma migrate dev --name init`)

### Módulo: Auth
- ✅ `POST /auth/login` — Validar email + password, devolver JWT
- ✅ `JwtAuthGuard` — Proteger todos los endpoints
- ✅ `TenantGuard` — Inyectar tenantId en cada request
- ✅ Decorador `@CurrentUser()` y `@Roles()`

### Módulo: Tenants
- ✅ `GET /tenants/:id` — Obtener datos del tenant
- ✅ `PATCH /tenants/:id` — Actualizar nombre, logo, plan
- ✅ `POST /tenants` — Crear tenant (solo SUPER_ADMIN)

### Módulo: Users
- ✅ `GET /users` — Listar usuarios del tenant
- ✅ `POST /users` — Invitar usuario (enviar correo con Resend)
- ✅ `PATCH /users/:id` — Actualizar rol o datos
- ✅ `DELETE /users/:id` — Desactivar usuario (soft delete)

### Módulo: Locations (Sucursales)
- ✅ `GET /locations` — Listar sucursales del tenant
- ✅ `POST /locations` — Crear sucursal
- ✅ `PATCH /locations/:id` — Editar
- ✅ `DELETE /locations/:id` — Desactivar

### Frontend — React + Vite + Tailwind
- ✅ Inicializar proyecto Vite en `frontend/`
- ✅ Instalar Tailwind CSS, react-router-dom, axios
- ✅ Configurar `axios` con interceptors (token JWT en headers)
- ✅ `AuthContext` — estado global de sesión
- ✅ Layout base: Sidebar + Navbar + rutas protegidas
- ✅ Pantalla: **Login** — conectada al backend real
- ✅ Pantalla: **Dashboard** — esqueleto con métricas vacías

---

## Semana 2 — Configuración de empresa

### Backend
- ✅ Módulo completo de Usuarios con invitación por correo
- ✅ Módulo Locations completo
- ✅ Módulo Products (catálogo por tenant)

### Frontend
- ✅ Pantalla: **Mi empresa** (datos + logo)
- ✅ Pantalla: **Sucursales / Estaciones**
- ✅ Pantalla: **Usuarios y roles**

---

## Semana 3 — Motor de aprobaciones

### Backend
- ✅ Módulo `approval-flows` — CRUD de niveles
- ✅ Endpoint para reordenar niveles (drag & drop)
- ✅ Validación: el nivel 5 (Compras) siempre es el último

### Frontend
- ✅ Pantalla: **Configurador de flujo** con drag & drop (dnd-kit)
- ✅ CRUD visual de niveles (agregar, editar, desactivar)

---

## Semana 4 — Solicitudes de Compra (SC)

### Backend
- ✅ Módulo `purchase-requests` — CRUD completo
- ✅ Motor de aprobaciones: avanzar nivel, rechazar, escalar
- ✅ Job Bull: escalamiento automático por tiempo límite (escalation.processor.ts)
- ✅ Notificaciones por correo (Resend) en cada cambio de estatus

### Frontend
- ✅ Pantalla: **Lista de SC** (filtros por estatus, sucursal, período)
- ✅ Pantalla: **Nueva SC** (formulario con productos y adjunto)
- ✅ Pantalla: **Detalle SC** (historial de aprobaciones + acciones)

---

## Semana 5 — Órdenes de Compra (OC)

### Backend
- ✅ Módulo `purchase-orders` — generar OC desde SC aprobada
- ✅ Generación de PDF (window.print() para MVP, vista OC formateada)
- ✅ Envío de PDF al proveedor por correo (Resend)
- ✅ Campo `folio` autoincremental en PurchaseOrder

### Frontend
- ✅ Pantalla: **Lista de OC**
- ✅ Pantalla: **Nueva / Editar OC** (conversor SC → OC con precios)
- ✅ Pantalla: **Detalle OC** (vista imprimible + envío a proveedor)

---

## Semana 6 — Facturas CFDI

### Backend
- ✅ Módulo `invoices` — POST /invoices, GET /invoices/orden/:id
- ✅ Validación: RFC vs proveedor, monto vs OC (>5% → DIFERENCIA_MONTO), UUID duplicado
- ✅ Almacenamiento en DB (xmlUrl/pdfUrl opcionales; XML parseado en frontend)

### Frontend
- ✅ Sección CFDI dentro del Detalle OC (visible cuando OC ≠ BORRADOR)
- ✅ Upload XML + DOMParser client-side + vista previa con alertas de validación
- ✅ URL PDF opcional + registro en backend

---

## Semana 7 — Inventario

### Backend
- ✅ Módulo `receptions` — POST /receptions, GET /receptions/orden/:id
- ✅ Módulo `inventory` — GET /inventory (stock), GET /inventory/movements, POST /inventory/adjust
- ✅ Trigger automático: recepción confirmada → upsert Inventory + InventoryMovement (ENTRADA)
- ✅ Alerta por stock mínimo en app (badge color + panel de alertas en StockActual)

### Frontend
- ✅ Pantalla: **Stock actual** (por sucursal, alertas stock bajo/agotado)
- ✅ Pantalla: **Catálogo de productos** (CRUD completo con stockMinimo)
- ✅ Pantalla: **Historial de movimientos** (filtro por sucursal)
- ✅ Sección **Recepción de Mercancía** en Detalle OC (form + historial de recepciones)

---

## Semana 8 — Proveedores y Reportes

### Backend
- ⏳ Módulo `suppliers` — CRUD completo
- ⏳ Módulo `reports` — consultas agregadas
- ⏳ Exportar a Excel (xlsx)

### Frontend
- ⏳ Pantalla: **Lista de proveedores**
- ⏳ Pantalla: **Alta / edición de proveedor**
- ⏳ Pantalla: **Reportes + Dashboard con métricas**

---

## Semana 9 — QA y Piloto

- ⏳ Pruebas end-to-end del ciclo completo (SC → OC → Factura → Inventario)
- ⏳ Corrección de bugs encontrados
- ⏳ Deploy a producción (Railway + Vercel)
- ⏳ Demo con cliente piloto
- ⏳ Recopilación de feedback

---

## Deuda técnica / Pendientes futuros

> Registrar aquí cosas que se decidió dejar para después durante el desarrollo.

| Fecha | Descripción | Prioridad |
|---|---|---|
| — | — | — |

---

## Decisiones técnicas tomadas

| Fecha | Decisión | Razón |
|---|---|---|
| 2026-03-21 | Row-level isolation sobre esquemas separados por tenant | Más simple de mantener para el MVP |
| 2026-03-21 | Resend para correos | API simple, free tier generoso (3,000/mes) |
| 2026-03-21 | Bull + Redis para jobs | Escalamiento automático y notificaciones sin bloquear requests |
