# GasDesk — Mejoras y Evolución del Sistema

> Documento vivo para rastrear mejoras post-MVP. Actualizar conforme se completan tareas.
>
> **Leyenda:** ✅ Completado · 🔄 En progreso · ⏳ Pendiente · ❌ Bloqueado

---

## Prioridad Crítica — Huecos en el flujo de negocio

### 1. Folio propio en Solicitudes de Compra ✅
- ✅ Agregar campo `folio` autoincremental en el modelo `PurchaseRequest` (Prisma)
- ✅ Migración de base de datos (`prisma db push`)
- ✅ Actualizar `purchase-requests.service.ts` — usa `req.folio` en notificaciones
- ✅ `DetalleSolicitud.tsx` y `ListaSolicitudes.tsx` muestran `SC-{folio}`

### 2. Recuperación de contraseña ✅
- ✅ Campos `resetToken` y `resetTokenExpiry` en modelo `User`
- ✅ `POST /auth/forgot-password` — genera token, envía correo con Resend
- ✅ `POST /auth/reset-password` — valida token, actualiza password
- ✅ Pantalla: **Olvidé mi contraseña** (`ForgotPassword.tsx`)
- ✅ Pantalla: **Nueva contraseña** (`ResetPassword.tsx` con token en query param)

### 3. Módulo de Cotizaciones (RFQ) ✅
- ✅ Modelo `Quotation` — solicitudId, supplierId, items, validezDías, estatus
- ✅ `POST /quotations`, `GET /quotations`, `GET /quotations/solicitud/:id`
- ✅ `PATCH /quotations/:id` (actualizar precios), `PATCH /quotations/:id/select`
- ✅ Al seleccionar ganadora: cancela las demás, SC pasa a EN_PROCESO
- ✅ Pantalla: **Nueva cotización** (`NuevaCotizacion.tsx`)
- ✅ Pantalla: **Comparativa de cotizaciones** (`ComparativaCotizaciones.tsx`) — tabla multi-proveedor con "mejor precio"
- ✅ Sidebar: ítem "Cotizaciones" para roles STAFF

### 4. Control de Presupuesto por Sucursal ✅
- ✅ Modelo `Budget` — tenantId, locationId, mes, año, montoAsignado, montoEjercido
- ✅ CRUD completo: `POST/GET/PATCH/DELETE /budgets`
- ✅ `BudgetsService.checkBudget()` — verifica disponibilidad (no bloqueante)
- ✅ Al crear SC: devuelve `alertaPresupuesto` si excede
- ✅ Pantalla: **Presupuestos** — tarjetas con barra de progreso verde/amarillo/rojo
- ⏳ Indicador de avance de presupuesto en Dashboard

---

## Prioridad Alta — Funcionalidades que el cliente pedirá

### 5. Cierre automático de OC por recepción completa ✅
- ✅ Ya implementado en `receptions.service.ts` (pre-existente)
- ✅ Compara suma de `cantidadRecibida` vs `cantidadOrdenada` por item
- ✅ Si todos completos → `COMPLETADA`; si parciales → `RECIBIDA_PARCIAL`

### 6. Notificaciones WhatsApp ❌ Diferido
- ❌ Diferido hasta v2 — proveedor (Twilio vs Meta) no definido

### 7. Notificaciones in-app en tiempo real ✅
- ✅ Instalado `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`
- ✅ `NotificationsGateway` — WebSocket en namespace `/notifications`, rooms por userId
- ✅ Modelo `Notification` con `userId, tipo, mensaje, leída, creadaEn`
- ✅ `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
- ✅ Frontend: `useNotifications` hook con `socket.io-client`
- ✅ Campana con badge de contador en Navbar
- ✅ Panel desplegable con historial y "Marcar todo leído"
- ✅ Integrado en `purchase-requests.service.ts` — notifica al crear/aprobar/rechazar SC

### 8. Exportar reportes a Excel (XLSX) ✅
- ✅ `exceljs` instalado en backend
- ✅ `GET /reports/gastos-proveedor/xlsx`
- ✅ `GET /reports/sc-por-estatus/xlsx`
- ✅ `GET /reports/oc-recientes/xlsx`
- ✅ Botones "↓ Excel" en `Reportes.tsx`

### 9. Validación de CFDI contra el SAT ✅
- ✅ `sat.service.ts` — SOAP a `verificacfdi.facturaelectronica.sat.gob.mx`
- ✅ Al crear factura: llama a SAT y guarda resultado (no bloqueante)
- ✅ Campos `validadoPorSAT` y `fechaValidacionSAT` en modelo `Invoice`
- ✅ Badge "✓ Verificado SAT" / "Sin verificar SAT" en `DetalleOrden.tsx`

---

## Prioridad Media — Calidad y operación

### 10. Historial de auditoría completo ✅
- ✅ Modelo `AuditLog` — entidad, entidadId, accion (CREATE/UPDATE/DELETE), camposModificados (JSON), usuarioId, fecha
- ✅ Registro automático mediante Prisma Extension.
- ✅ `GET /audit-log` — listar logs con filtros (entidad, usuario, fechas)
- ✅ Pantalla: **Auditoría** (solo con permiso `view_audit`)

### 11. Catálogo de precios por proveedor ✅
- ✅ Modelo `SupplierPrice` — registro automático al crear OC
- ✅ `POST/GET /suppliers/:id/prices` — gestión manual de precios
- ✅ En `NuevaOrden.tsx`: autocompletar precio y detectar variaciones >5%
- ✅ Alertas visuales críticas para control de costos

### 12. Dashboard analytics enriquecido ✅
- ✅ Endpoints de reportes: `spending-trend`, `top-suppliers`, `approval-time`
- ✅ Gráfica de tendencias con Recharts en Dashboard
- ✅ Gráfica de dona para concentración de proveedores
- ✅ KPI: Tiempo promedio de aprobación (SC -> OC)

### 13. Permisos granulares por perfil (RBAC real) ✅
- ✅ Decorador `@Permissions()` y `PermissionsGuard` en backend
- ✅ Mapeo centralizado Role -> Capability
- ✅ Frontend: `hasPermission` helper y `PermissionGuard`
- ✅ Navegación y UI adaptada dinámicamente según capacidades

### 14. Rate limiting y seguridad ✅
- ✅ `@nestjs/throttler` configurado para login (10 intentos / 15 min)
- ✅ `helmet` para headers de seguridad
- ✅ Validación estricta de `tenantId` en base de datos (Prisma context)

### 15. Refresh tokens ✅
- ✅ Modelo `RefreshToken` con rotación y revocación
- ✅ `/auth/refresh` y `/auth/logout` funcionales
- ✅ Interceptor frontend con auto-refresh transparente ante 401

---

## Deuda técnica

### 16. TODOs existentes en el código ✅
- ✅ Tipado estricto en servicios de OC y reportes.
- ✅ Integración completa de productos en Solicitudes.

### 17. Manual de Uso y Documentación ✅
- ✅ Creado `manual_usuario.md` con guías y capturas conceptuales.
- ✅ Walkthrough actualizado con el estado final de las fases 2 y 3.

---

## Futuro / v2

| Feature | Descripción | Notas |
|---|---|---|
| **PWA / App móvil** | Notificaciones push, aprobar desde celular | Considerar React Native o PWA primero |
| **Portal del proveedor** | El proveedor sube su CFDI directamente | Requiere auth separada para externos |
| **Módulo de ventas / despacho** | Registrar salidas de inventario por venta | Cierra el ciclo compra → stock → venta |
| **Integración con PAC** | Emitir CFDIs propios (timbrado) | Finkok, SW Sapien, Edicom |
| **Integración con SAP/ERP** | Sincronizar datos con ERP del cliente | Para clientes enterprise |
| **Geo-localización de sucursales** | Mapa con ubicación de estaciones | Google Maps API |
| **Multi-moneda** | Compras en USD para proveedores extranjeros | Tipo de cambio diario SAT |
| **Multi-idioma (i18n)** | Expansión a otros países de LatAm | react-i18next |

---

## Decisiones pendientes

| # | Decisión | Opciones | Notas |
|---|---|---|---|
| 1 | WhatsApp: ¿Twilio o Meta Cloud API? | Twilio (más fácil) vs Meta directo (más barato) | Twilio tiene mejor DX |
| 2 | Gráficas en Dashboard | Recharts vs Chart.js vs Tremor | Recharts es más React-native |
| 3 | Almacenamiento de archivos (XML, PDF, logos) | Supabase Storage (Implementado) | ✅ Completado |
| 4 | Validación SAT: ¿directa o vía PAC? | SAT directo (gratis, inestable) vs PAC (costo, confiable) | Empezar con SAT directo |
