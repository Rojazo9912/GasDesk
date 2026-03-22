# GasDesk — Sistema de Compras e Inventarios Multi-empresa

> Plataforma SaaS centralizada donde cada empresa gestiona sus compras e inventarios de forma independiente, y el corporativo tiene visibilidad total en tiempo real.

---

## Contexto del proyecto

Sistema dirigido a empresas del sector gasolinero (franquicias, cadenas de estaciones) y sus empresas hermanas de otros giros. Una sola plataforma, múltiples empresas aisladas entre sí, con visibilidad consolidada para el corporativo.

**Problema que resuelve:** Las cadenas de gasolineras hoy gestionan sus compras por correo, WhatsApp y hojas de Excel. No hay trazabilidad, los flujos de aprobación son informales, y el inventario se desactualiza con frecuencia. GasDesk digitaliza y automatiza todo el ciclo, desde la solicitud hasta el registro en inventario.

---

## Stack tecnológico

| Capa | Tecnología | Hosting |
|---|---|---|
| Backend | NestJS + TypeScript | Railway |
| ORM | Prisma | — |
| Base de datos | PostgreSQL | Supabase |
| Auth | JWT + Guards en NestJS | — |
| Frontend | React + Tailwind CSS | Railway / Vercel |
| PDFs | Puppeteer o pdf-lib | — |
| Correos | Resend | — |
| Archivos | Supabase Storage | — |
| Colas / Jobs | Bull + Redis | Railway |
| Drag & drop | dnd-kit | — |
| Validación CFDI | SAT Web Services (opcional v1.1) | — |

---

## Arquitectura multi-tenant

Un solo sistema, múltiples empresas aisladas por `tenantId` (row-level isolation, no esquemas separados):

```
app.gasdesk.mx  (una sola URL)
        │
        ├── Login → identifica empresa + rol → contexto de sesión
        │
        ├── Tenant: Gasolineras del Norte SA
        │     ├── Estación Durango Centro
        │     ├── Estación Guadalajara Norte
        │     └── Vista corporativa (todas las estaciones)
        │
        ├── Tenant: Transportes Hermana SA
        │     └── Almacén central
        │
        └── Tenant: Constructora Hermana SA
              └── Bodega de materiales
```

**Garantías de aislamiento:**
- Todo endpoint protegido con guard que inyecta `tenantId` desde el JWT.
- Ninguna consulta devuelve datos de otro tenant.
- El SUPER_ADMIN puede operar entre tenants desde un panel separado.

---

## Roles del sistema

| Rol | Descripción | Acceso clave |
|---|---|---|
| SUPER_ADMIN | Proveedor del sistema — gestiona tenants y suscripciones | Panel global |
| ADMIN | Configura empresa, usuarios, catálogos y flujos | Configuración completa del tenant |
| SOLICITANTE | Genera solicitudes de compra | Crear SC, ver sus SC |
| GERENTE | Aprueba solicitudes a nivel operativo | Aprobar / rechazar SC nivel 1 |
| CONTRALOR | Segunda validación presupuestal | Aprobar / rechazar SC nivel 2 |
| COMPRAS | Recibe SC aprobadas, gestiona OC y proveedores | OC, proveedores |
| ALMACENISTA | Registra recepciones y movimientos de inventario | Recepciones, inventario |

---

## Ciclo de compra completo

```
[1] SOLICITUD DE COMPRA (SC)
     │  Quién solicita, qué, cuánto, para qué estación
     │  Se aprueba por flujo configurable (drag & drop)
     ▼
[2] ORDEN DE COMPRA (OC)
     │  Se genera desde la SC aprobada (datos copiados automáticamente)
     │  Se asigna proveedor, precio y condiciones
     │  Se envía al proveedor en PDF por correo
     ▼
[3] RECEPCIÓN + FACTURA
     │  El almacenista registra lo que físicamente llega
     │  Se sube el XML y PDF del CFDI
     │  Se valida contra la OC automáticamente (RFC, monto, UUID)
     │  Se registran diferencias si las hay
     ▼
[4] INVENTARIO (actualización automática)
       Lo recibido incrementa el stock de la estación/almacén
       Sin intervención manual — genera movimiento trazable
```

---

## Flujo de aprobaciones configurable

El ADMIN configura el flujo desde el panel sin tocar código. Puede agregar, eliminar, reordenar y reasignar niveles en cualquier momento.

### Flujo base

```
Solicitante → Gerencia Operativa → Contraloría → Depto. de Compras
```

### Niveles disponibles

| Nivel | Nombre sugerido | Tipo |
|---|---|---|
| 0 | Jefe de Departamento | Opcional |
| 1 | Gerencia Operativa | Base |
| 2 | Contraloría | Base |
| 3 | Dirección General | Opcional |
| 4 | Corporativo | Opcional |
| 5 | Depto. de Compras | Fijo (siempre último) |

### Parámetros configurables por nivel

- Nombre del nivel (libre)
- Aprobador asignado y aprobador alterno
- ¿Puede rechazar? (Sí / No)
- ¿Puede reasignar? (Sí / No)
- Tiempo límite para aprobar (en horas)
- Tipo de notificación: `email` / `whatsapp` / `ambos`
- Activo / Inactivo (pausar sin borrar)

### Ciclo de vida de una SC

```
borrador → pendiente_nivel_1 → pendiente_nivel_2 → pendiente_compras → en_proceso → completada
                    ↓                   ↓
                rechazada           rechazada
```

### Escalamiento automático

Si una SC lleva N horas sin respuesta, el sistema notifica al aprobador. Si pasa el límite configurado, la SC escala automáticamente al nivel superior y el evento queda registrado en el historial de auditoría.

---

## Módulos del MVP

### 1. Multi-tenant y configuración
- Registro de empresa (tenant)
- Login único con identificación de empresa y rol
- Configuración: nombre, logo, sucursales/estaciones
- Invitar usuarios y asignarles rol
- Gestión de planes y suscripciones (SUPER_ADMIN)

### 2. Solicitudes de Compra (SC)
- Crear SC con productos, cantidades y justificación
- Adjuntar imagen o documento (upload a Supabase Storage)
- Flujo configurable de aprobación con drag & drop (dnd-kit)
- Aprobar / Rechazar con comentario obligatorio
- Notificación por correo en cada paso del flujo
- Estatus visible en tiempo real para todos los involucrados

### 3. Órdenes de Compra (OC)
- Generar OC directamente desde una SC aprobada
- Asignar proveedor y editar precios unitarios
- Generar PDF de la OC automáticamente (Puppeteer / pdf-lib)
- Enviar OC al proveedor por correo desde el sistema (Resend)
- Estatus: `enviada` / `recibida_parcial` / `completada` / `cancelada`

### 4. Factura del proveedor (CFDI)
- Subir PDF y XML del CFDI
- Almacenamiento en Supabase Storage
- Validación automática:
  - RFC del proveedor coincide
  - Monto total vs OC (alerta si diferencia > 5%)
  - UUID no duplicado en el sistema
- Alerta visual si la validación falla

### 5. Inventario
- Catálogo de productos por tenant (nombre, unidad, categoría, stock mínimo)
- Inventario actual por sucursal/estación
- Entrada automática al confirmar recepción de OC
- Alerta push/correo cuando stock baja del mínimo
- Historial de movimientos por producto (entradas, salidas, ajustes)

### 6. Proveedores
- Alta con RFC, contacto y condiciones de pago
- Asociar proveedor a categorías de productos
- Historial de OC por proveedor

### 7. Reportes básicos
- SC por estatus y período
- Gasto por proveedor y período
- Inventario actual por sucursal
- Movimientos de inventario
- Exportar cualquier reporte a Excel

---

## Pantallas del MVP (18 vistas)

```
AUTH
 └── Login

CONFIGURACIÓN
 ├── Mi empresa (datos + logo)
 ├── Sucursales / estaciones
 ├── Usuarios y roles
 └── Flujo de aprobación (configurador drag & drop)

COMPRAS
 ├── Lista de SC (filtros por estatus, estación, período)
 ├── Nueva SC
 ├── Detalle SC (con historial de aprobaciones y comentarios)
 ├── Lista de OC
 ├── Nueva / Editar OC
 └── Detalle OC (con factura, recepción y estado)

INVENTARIO
 ├── Stock actual (por sucursal con alertas de mínimo)
 ├── Catálogo de productos
 └── Historial de movimientos

PROVEEDORES
 ├── Lista de proveedores
 └── Alta / edición de proveedor

REPORTES
 └── Dashboard con métricas clave + exportar Excel
```

---

## Estructura del proyecto

```
gasdesk/
├── backend/                    # NestJS
│   ├── src/
│   │   ├── auth/               # Login, JWT, guards, decorators
│   │   ├── tenants/            # Multi-tenant, configuración
│   │   ├── users/              # Usuarios y roles
│   │   ├── locations/          # Sucursales/estaciones
│   │   ├── approval-flows/     # Configurador de flujos + motor de aprobaciones
│   │   ├── purchase-requests/  # SC (solicitudes de compra)
│   │   ├── purchase-orders/    # OC + generación de PDF
│   │   ├── invoices/           # Facturas CFDI + validación
│   │   ├── receptions/         # Recepciones físicas de mercancía
│   │   ├── inventory/          # Inventario + movimientos
│   │   ├── suppliers/          # Proveedores
│   │   ├── notifications/      # Correos (Resend) y alertas
│   │   ├── reports/            # Reportes y exports Excel
│   │   └── storage/            # Integración Supabase Storage
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── frontend/                   # React + Tailwind CSS
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   │   ├── ui/             # Componentes base (Button, Modal, Table…)
    │   │   ├── approval/       # Configurador de flujo drag & drop
    │   │   └── shared/         # Layout, Navbar, Sidebar
    │   ├── hooks/
    │   ├── context/            # AuthContext, TenantContext
    │   └── services/           # Llamadas a la API (axios / fetch)
    └── package.json
```

---

## Schema de base de datos (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ────────────────────────────────────────────────────────────────────

enum Rol {
  SUPER_ADMIN
  ADMIN
  SOLICITANTE
  GERENTE
  CONTRALOR
  COMPRAS
  ALMACENISTA
}

enum EstatusSC {
  BORRADOR
  PENDIENTE_NIVEL_1
  PENDIENTE_NIVEL_2
  PENDIENTE_NIVEL_3
  PENDIENTE_COMPRAS
  EN_PROCESO
  COMPLETADA
  RECHAZADA
  CANCELADA
}

enum EstatusOC {
  BORRADOR
  ENVIADA
  RECIBIDA_PARCIAL
  COMPLETADA
  CANCELADA
}

enum TipoNotificacion {
  EMAIL
  WHATSAPP
  AMBOS
}

enum TipoMovimiento {
  ENTRADA
  SALIDA
  AJUSTE
}

enum EstatusValidacionCFDI {
  PENDIENTE
  VALIDA
  DIFERENCIA_MONTO
  RFC_INVALIDO
  UUID_DUPLICADO
  ERROR
}

// ─── Tenant ───────────────────────────────────────────────────────────────────

model Tenant {
  id       String  @id @default(uuid())
  nombre   String
  rfc      String  @unique
  logo     String?
  plan     String  @default("basico")
  activo   Boolean @default(true)
  creadoEn DateTime @default(now())

  usuarios    User[]
  sucursales  Location[]
  flujos      ApprovalFlow[]
  solicitudes PurchaseRequest[]
  ordenes     PurchaseOrder[]
  proveedores Supplier[]
  productos   Product[]
}

// ─── Users ────────────────────────────────────────────────────────────────────

model User {
  id       String   @id @default(uuid())
  tenantId String
  nombre   String
  email    String   @unique
  password String
  rol      Rol
  activo   Boolean  @default(true)
  creadoEn DateTime @default(now())

  tenant       Tenant            @relation(fields: [tenantId], references: [id])
  solicitudes  PurchaseRequest[] @relation("Solicitante")
  recepciones  Reception[]       @relation("Almacenista")
  aprobaciones ApprovalHistory[]
  flujosComoAprobador  ApprovalFlow[] @relation("Aprobador")
  flujosComoAlterno    ApprovalFlow[] @relation("Alterno")
}

// ─── Locations ────────────────────────────────────────────────────────────────

model Location {
  id        String  @id @default(uuid())
  tenantId  String
  nombre    String
  tipo      String  // "estacion" | "almacen" | "bodega"
  direccion String?

  tenant      Tenant            @relation(fields: [tenantId], references: [id])
  inventarios Inventory[]
  solicitudes PurchaseRequest[]
  ordenes     PurchaseOrder[]
}

// ─── Approval Flows ───────────────────────────────────────────────────────────

model ApprovalFlow {
  id              String           @id @default(uuid())
  tenantId        String
  nivelOrden      Int
  nombre          String
  aprobadorId     String
  alternoId       String?
  puedeRechazar   Boolean          @default(true)
  puedeReasignar  Boolean          @default(false)
  tiempoLimiteHrs Int?
  notificacion    TipoNotificacion @default(EMAIL)
  activo          Boolean          @default(true)
  esFijo          Boolean          @default(false)

  tenant    Tenant            @relation(fields: [tenantId], references: [id])
  aprobador User              @relation("Aprobador", fields: [aprobadorId], references: [id])
  alterno   User?             @relation("Alterno", fields: [alternoId], references: [id])
  historial ApprovalHistory[]
}

model ApprovalHistory {
  id          String   @id @default(uuid())
  solicitudId String
  flowId      String
  aprobadorId String
  accion      String   // "aprobado" | "rechazado" | "reasignado" | "escalado"
  comentario  String?
  fecha       DateTime @default(now())

  solicitud PurchaseRequest @relation(fields: [solicitudId], references: [id])
  flow      ApprovalFlow    @relation(fields: [flowId], references: [id])
  aprobador User            @relation(fields: [aprobadorId], references: [id])
}

// ─── Products & Inventory ─────────────────────────────────────────────────────

model Product {
  id          String  @id @default(uuid())
  tenantId    String
  nombre      String
  unidad      String  // "litros" | "piezas" | "kg" | "cajas" …
  categoria   String
  stockMinimo Float   @default(0)
  activo      Boolean @default(true)

  tenant      Tenant                @relation(fields: [tenantId], references: [id])
  inventarios Inventory[]
  scItems     PurchaseRequestItem[]
  ocItems     PurchaseOrderItem[]
  movimientos InventoryMovement[]
  recepcionItems ReceptionItem[]
}

model Inventory {
  id         String @id @default(uuid())
  productId  String
  locationId String
  cantidad   Float  @default(0)

  product  Product  @relation(fields: [productId], references: [id])
  location Location @relation(fields: [locationId], references: [id])

  @@unique([productId, locationId])
}

model InventoryMovement {
  id         String         @id @default(uuid())
  productId  String
  locationId String
  tipo       TipoMovimiento
  cantidad   Float
  origenTipo String         // "recepcion" | "ajuste_manual" | "salida"
  origenId   String?
  notas      String?
  fecha      DateTime       @default(now())

  product Product @relation(fields: [productId], references: [id])
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

model Supplier {
  id              String  @id @default(uuid())
  tenantId        String
  nombre          String
  rfc             String
  contactoNombre  String?
  contactoEmail   String?
  contactoTel     String?
  condicionesPago String?
  activo          Boolean @default(true)

  tenant  Tenant          @relation(fields: [tenantId], references: [id])
  ordenes PurchaseOrder[]

  @@unique([tenantId, rfc])
}

// ─── Purchase Requests (SC) ───────────────────────────────────────────────────

model PurchaseRequest {
  id            String     @id @default(uuid())
  tenantId      String
  locationId    String
  solicitanteId String
  estatus       EstatusSC  @default(BORRADOR)
  nivelActual   Int        @default(1)
  notas         String?
  adjuntoUrl    String?    // URL en Supabase Storage
  creadoEn      DateTime   @default(now())
  actualizadoEn DateTime   @updatedAt

  tenant      Tenant                @relation(fields: [tenantId], references: [id])
  location    Location              @relation(fields: [locationId], references: [id])
  solicitante User                  @relation("Solicitante", fields: [solicitanteId], references: [id])
  items       PurchaseRequestItem[]
  historial   ApprovalHistory[]
  ordenes     PurchaseOrder[]
}

model PurchaseRequestItem {
  id                 String  @id @default(uuid())
  solicitudId        String
  productId          String
  cantidadSolicitada Float
  justificacion      String?

  solicitud PurchaseRequest @relation(fields: [solicitudId], references: [id])
  product   Product         @relation(fields: [productId], references: [id])
}

// ─── Purchase Orders (OC) ─────────────────────────────────────────────────────

model PurchaseOrder {
  id                   String     @id @default(uuid())
  tenantId             String
  solicitudId          String
  supplierId           String
  locationId           String
  estatus              EstatusOC  @default(BORRADOR)
  fechaEmision         DateTime   @default(now())
  fechaEntregaEsperada DateTime?
  subtotal             Float      @default(0)
  iva                  Float      @default(0)
  total                Float      @default(0)
  pdfUrl               String?
  actualizadoEn        DateTime   @updatedAt

  tenant    Tenant              @relation(fields: [tenantId], references: [id])
  solicitud PurchaseRequest     @relation(fields: [solicitudId], references: [id])
  supplier  Supplier            @relation(fields: [supplierId], references: [id])
  location  Location            @relation(fields: [locationId], references: [id])
  items     PurchaseOrderItem[]
  facturas  Invoice[]
  recepciones Reception[]
}

model PurchaseOrderItem {
  id               String @id @default(uuid())
  ordenId          String
  productId        String
  cantidadOrdenada Float
  precioUnitario   Float
  importe          Float

  orden   PurchaseOrder @relation(fields: [ordenId], references: [id])
  product Product       @relation(fields: [productId], references: [id])
}

// ─── Invoices (CFDI) ──────────────────────────────────────────────────────────

model Invoice {
  id                String                @id @default(uuid())
  ordenId           String
  folioFiscalUuid   String                @unique
  xmlUrl            String?
  pdfUrl            String?
  fechaEmision      DateTime
  subtotal          Float
  iva               Float
  total             Float
  estatusValidacion EstatusValidacionCFDI @default(PENDIENTE)
  notasValidacion   String?               // detalle del error si aplica
  creadoEn          DateTime              @default(now())

  orden       PurchaseOrder @relation(fields: [ordenId], references: [id])
  recepciones Reception[]
}

// ─── Receptions ───────────────────────────────────────────────────────────────

model Reception {
  id            String   @id @default(uuid())
  ordenId       String
  facturaId     String?
  almacenistaId String
  fecha         DateTime @default(now())
  notas         String?

  orden        PurchaseOrder  @relation(fields: [ordenId], references: [id])
  factura      Invoice?       @relation(fields: [facturaId], references: [id])
  almacenista  User           @relation("Almacenista", fields: [almacenistaId], references: [id])
  items        ReceptionItem[]
}

model ReceptionItem {
  id               String @id @default(uuid())
  recepcionId      String
  productId        String
  cantidadRecibida Float
  notas            String? // diferencias o daños observados

  recepcion Reception @relation(fields: [recepcionId], references: [id])
  product   Product   @relation(fields: [productId], references: [id])
}
```

---

## Reglas de negocio clave

| Regla | Descripción |
|---|---|
| Copia de datos SC → OC | Al generar una OC desde una SC, los items se copian automáticamente. El usuario solo ajusta precios y proveedor. |
| Entrada automática de inventario | Al confirmar una recepción, el sistema suma `cantidadRecibida` al stock de la ubicación, sin intervención manual. |
| Validación CFDI | Si la diferencia entre el total del CFDI y el total de la OC supera el 5%, se marca como `DIFERENCIA_MONTO` y se alerta al área de compras. |
| UUID duplicado | El sistema rechaza una factura si el `folioFiscalUuid` ya existe en cualquier OC del tenant. |
| Escalamiento automático | Si un nivel de aprobación no responde en `tiempoLimiteHrs`, se notifica y luego se escala. El evento queda en el historial. |
| Stock mínimo | Si `cantidad` en `Inventory` cae por debajo de `stockMinimo` del producto, se dispara alerta al ALMACENISTA y al COMPRAS del tenant. |

---

## Plan de desarrollo — 9 semanas

| Semana | Entregable | Módulos |
|---|---|---|
| 1 | Setup e infraestructura | NestJS + Supabase + Railway, multi-tenant, auth, JWT, guards, roles |
| 2 | Configuración de empresa | Usuarios, sucursales, catálogo de productos |
| 3 | Motor de aprobaciones | Configurador drag & drop (dnd-kit), CRUD de flujos, lógica de niveles |
| 4 | Solicitudes de Compra | SC completo + motor de aprobaciones + notificaciones por correo (Resend) |
| 5 | Órdenes de Compra | OC completo + generación de PDF + envío por correo al proveedor |
| 6 | Facturas CFDI | Upload XML/PDF + validación automática (RFC, monto, UUID) |
| 7 | Inventario | Stock por sucursal + entrada automática por recepción + alertas |
| 8 | Proveedores y reportes | Catálogo de proveedores + reportes básicos + exportar Excel |
| 9 | QA y piloto | Pruebas end-to-end, correcciones, demo con cliente piloto |

---

## Roadmap post-MVP

| Feature | Versión | Descripción |
|---|---|---|
| Flujos condicionales por monto/categoría | v1.1 | Si monto > $50,000 → agrega nivel de Dirección automáticamente |
| Validación SAT en tiempo real | v1.1 | Consulta el estado del CFDI directamente con el SAT |
| Portal de proveedores | v1.1 | Login para proveedores: ver OC, subir facturas |
| App móvil para aprobaciones | v1.2 | Flutter o React Native para aprobar SC desde el celular |
| Reorden automático por stock mínimo | v1.2 | Genera SC borrador automáticamente al bajar del mínimo |
| Reportes programados por correo | v1.2 | Envío semanal de resumen de inventario y gastos |
| Asistente IA sobre datos | v1.3 | Chat sobre compras, proveedores e inventario del tenant |
| Integración CONTPAQi / Aspel | v1.3 | Exportar facturas y movimientos a sistemas contables |
| Predicción de consumo | v2.0 | ML para anticipar necesidades de recompra |

---

## Modelo de negocio SaaS

| Plan | Para quién | Precio sugerido (MXN/mes) |
|---|---|---|
| Básico | 1 empresa, hasta 3 usuarios | $800 |
| Estándar | 1 empresa, hasta 10 usuarios, multi-sucursal | $1,800 |
| Corporativo | Hasta 5 empresas del grupo, usuarios ilimitados | $4,500 |
| Enterprise | Grupos grandes, personalización, soporte dedicado | Cotización |

---

## Costos de infraestructura (etapa inicial)

| Servicio | Plan | Costo |
|---|---|---|
| Supabase (DB + Storage) | Free tier | $0 |
| Railway (Backend + Redis) | Hobby | ~$5 USD/mes |
| Dominio | Cloudflare | ~$10 USD/año |
| Resend (correos) | Free (3,000/mes) | $0 |
| **Total estimado** | | **~$5–10 USD/mes** |

---

## Variables de entorno requeridas

```env
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d

# Supabase Storage
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=...

# Correos
RESEND_API_KEY=...
RESEND_FROM=noreply@gasdesk.mx

# Redis (Bull)
REDIS_URL=redis://...
```

---

## Convenciones de desarrollo

- **Naming:** camelCase en código, snake_case en BD generado por Prisma.
- **Guard global:** Todos los endpoints protegidos por `JwtAuthGuard` + `TenantGuard`. Solo `/auth/login` es público.
- **DTOs:** Validación con `class-validator` en todos los endpoints de entrada.
- **Errores:** Usar `HttpException` con mensajes descriptivos y códigos estándar HTTP.
- **Archivos:** Todo upload va a Supabase Storage. El backend solo almacena la URL pública resultante.
- **Jobs:** Las notificaciones y el escalamiento automático se procesan vía colas Bull para no bloquear el request.
