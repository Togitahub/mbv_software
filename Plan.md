# PLAN SOFTWARE MBV – REQUISITOS DEL SISTEMA (VERSIÓN ESTRUCTURADA Y CORREGIDA)

## Estructura del proyecto

software_mbv/
├── server/
│ ├── config/
│ │ ├── apolloServer.js
│ │ ├── cloudinary.js
│ │ ├── cookieConfig.js
│ │ ├── createAdmin.js
│ │ ├── mongodb.js
│ │ └── nodemailer.js
│ ├── models/
│ │ ├── Car.js
│ │ ├── DaveCar.js
│ │ ├── CompanyBalance.js
│ │ ├── Expense.js
│ │ ├── GeneralExpense.js
│ │ ├── Brand.js
│ │ ├── CarModel.js
│ │ ├── JCPayment.js
│ │ ├── ClientPayment.js
│ │ ├── ExchangeRate.js
│ │ └── User.js
│ ├── graphql/
│ │ ├── typeDefs/
│ │ │ ├── carDefs.js
│ │ │ ├── daveCarDefs.js
│ │ │ ├── companyBalanceDefs.js
│ │ │ ├── expenseDefs.js
│ │ │ ├── generalExpenseDefs.js
│ │ │ ├── brandModelDefs.js
│ │ │ ├── jcPaymentDefs.js
│ │ │ ├── clientPaymentDefs.js
│ │ │ ├── userDefs.js
│ │ │ ├── exchangeRateDefs.js
│ │ │ └── rootDefs.js
│ │ ├── resolvers/
│ │ │ ├── rootResolvers.js
│ │ │ ├── carResolvers.js
│ │ │ ├── daveCarResolvers.js
│ │ │ ├── companyBalanceResolvers.js
│ │ │ ├── expenseResolvers.js
│ │ │ ├── generalExpenseResolvers.js
│ │ │ ├── brandModelResolvers.js
│ │ │ ├── jcPaymentResolvers.js
│ │ │ ├── clientPaymentResolvers.js
│ │ │ ├── exchangeRateResolvers.js
│ │ │ └── userResolvers.js
│ ├── utils/
│ │ ├── currencyConverter.js # CRC/USD conversion with manual exchange rate
│ │ ├── dateUtils.js
│ │ └── profitCalculator.js # Profit calculation per car
│ ├── index.js # Apollo Server + Express configuration and startup
│ └── .env # Environment variables (do not commit)
├── client/
│ ├── public/
│ │ └── favicon.ico
│ ├── src/
│ │ ├── assets/
│ │ │ └── logo.svg # Company logo
│ │ ├── components/
│ │ │ ├── common/
│ │ │ │ ├── Filters.jsx
│ │ │ │ ├── Pagination.jsx
│ │ │ │ ├── Navbar.jsx
│ │ │ │ └── Footer.jsx
│ │ │ ├── cars/
│ │ │ │ ├── CarCard.jsx # Summary view (client/admin)
│ │ │ │ ├── CarDetail.jsx # Detail view
│ │ │ │ ├── CarForm.jsx # Create/edit form
│ │ │ │ ├── ImageGallery.jsx # Image carousel
│ │ │ │ ├── ImageUploader.jsx
│ │ │ │ └── ProfitSimulator.jsx # Profit calculator simulator (no save) just calculate wihout button to sabe or similar
│ │ │ ├── clients/
│ │ │ │ ├── ClientForm.jsx
│ │ │ │ └── MyCarsTimeline.jsx # Logistic timeline for client
│ │ │ ├── expenses/
│ │ │ │ ├── ExpenseForm.jsx
│ │ │ │ └── GeneralExpenseForm.jsx
│ │ │ ├── juanCarlos/
│ │ │ │ ├── JCPaymentForm.jsx
│ │ │ │ └── DebtSummary.jsx
│ │ │ ├── dashboard/
│ │ │ │ └── DateRangeFilter.jsx
│ │ │ └── ui/
│ │ │ ├── Badge.jsx
│ │ │ ├── Button.jsx
│ │ │ ├── EmptyState.jsx
│ │ │ ├── ErrorMessage.jsx
│ │ │ ├── Input.jsx
│ │ │ ├── LoadingUi.jsx
│ │ │ ├── Modal.jsx
│ │ │ ├── Select.jsx
│ │ │ ├── ThemeChanger.jsx
│ │ │ └── Toast.jsx
│ │ ├── config/
│ │ │ └── apolloClient.js
│ │ ├── pages/
│ │ │ ├── LandingPage.jsx # Home with hero and full catalog with filters
│ │ │ ├── BrandsPage.jsx # Brand list with pagination
│ │ │ ├── ModelsPage.jsx # Model list
│ │ │ ├── AuthPage.jsx
│ │ │ ├── MyAccountPage.jsx
│ │ │ ├── MyCarsPage.jsx # Clients with commissioned cars see their cars
│ │ │ ├── AdminPanel/
│ │ │ │ ├── AdminDashboardPage.jsx # Full dashboard
│ │ │ │ ├── CarsManagementPage.jsx # Car CRUD
│ │ │ │ ├── DaveCarsListPage.jsx # Separate list for Dave's cars
│ │ │ │ ├── ClientsManagementPage.jsx
│ │ │ │ ├── ExpensesManagementPage.jsx
│ │ │ │ ├── GeneralExpensesPage.jsx
│ │ │ │ ├── JCPaymentsManagementPage.jsx
│ │ │ │ ├── ClientPaymentsManagementPage.jsx
│ │ │ │ ├── AccountingReportPage.jsx # PDF generator for accountant
│ │ │ │ └── UsersManagementPage.jsx # Superadmin only
│ │ │ └── NoMatchPage.jsx
│ │ ├── context/
│ │ │ ├── AuthContext.jsx
│ │ │ ├── CarContext.jsx
│ │ │ ├── ExpensesContext.jsx
│ │ │ ├── ThemeContext.jsx
│ │ │ ├── ToastContext.jsx
│ │ │ └── WhatsAppContext.jsx
│ │ ├── routes/
│ │ │ ├── ProtectedRoutes.jsx
│ │ │ ├── ScrollToTop.jsx
│ │ │ └── TokenWatcher.jsx
│ │ ├── graphql/
│ │ │ ├── queries/
│ │ │ │ ├── carQueries.js
│ │ │ │ ├── clientQueries.js
│ │ │ │ ├── expenseQueries.js
│ │ │ │ └── ...
│ │ │ ├── mutations/
│ │ │ │ ├── carMutations.js
│ │ │ │ ├── clientMutations.js
│ │ │ │ ├── expenseMutations.js
│ │ │ │ └── ...
│ │ │ └── fragments/
│ │ ├── utils/
│ │ │ ├── constants.js # Statuses, types, etc.
│ │ │ ├── formatters.js # Currency, date formatting
│ │ │ ├── imageUtils.js
│ │ │ ├── tokenUtils.js
│ │ │ ├── validators.js
│ │ │ └── whatsappMessage.js # Generates predefined inquiry message
│ │ ├── App.jsx
│ │ ├── index.css
│ │ └── main.jsx
│ ├── index.html
│ ├── .env
│ └── vite.config.js
├── .gitignore
├── README.md
└── package.json (separate for backend and frontend)

## DATA MODELS

Below are the MongoDB (Mongoose) schemas for each collection.

### 1. User (`User`)

| Field               | Type                       | Required    | Description                                                               |
| ------------------- | -------------------------- | ----------- | ------------------------------------------------------------------------- |
| `name`              | String                     | Yes         | Full name                                                                 |
| `email`             | String                     | Yes, unique | Email (login)                                                             |
| `password`          | String                     | Yes         | Hashed with bcrypt                                                        |
| `role`              | String                     | Yes         | `superadmin`, `admin`, `client`. Default: `client`                        |
| `phone`             | String                     | No          | WhatsApp number                                                           |
| `address`           | String                     | No          | Physical address                                                          |
| `registrationDate`  | Date                       | Yes         | Default: `Date.now`                                                       |
| `commissionedCars`  | Array (ObjectId ref `Car`) | No          | List of assigned commissioned cars                                        |
| `isDirectBuyer`     | Boolean                    | Yes         | Default: `false`                                                          |
| `active`            | Boolean                    | Yes         | Default: `true`                                                           |
| `temporaryPassword` | Boolean                    | Yes         | Default: `false`. Indicates if created by admin with a temporary password |

### 2. Brand (`Brand`)

| Field       | Type                  | Required    | Description             |
| ----------- | --------------------- | ----------- | ----------------------- |
| `name`      | String                | Yes, unique | E.g., "Toyota", "Honda" |
| `createdBy` | ObjectId (ref `User`) | No          | Audit                   |

### 3. CarModel (`CarModel`)

| Field       | Type                   | Required | Description         |
| ----------- | ---------------------- | -------- | ------------------- |
| `name`      | String                 | Yes      | E.g., "Corolla"     |
| `brand`     | ObjectId (ref `Brand`) | Yes      | Brand it belongs to |
| `createdBy` | ObjectId (ref `User`)  | No       | Audit               |

### 4. Car (`Car`) – for MBV cars

**Identification and dates**

| Field                 | Type                      | Required    | Description           |
| --------------------- | ------------------------- | ----------- | --------------------- |
| `brand`               | ObjectId (ref `Brand`)    | Yes         |                       |
| `carModel`            | ObjectId (ref `CarModel`) | Yes         |                       |
| `vin`                 | String                    | Yes, unique | VIN number            |
| `dua`                 | String                    | Yes, unique | Costa Rica DUA        |
| `year`                | Number                    | Yes         | Manufacturing year    |
| `purchaseDate`        | Date                      | Yes         | Purchase in USA       |
| `saleDate`            | Date                      | No          | Manual when sold      |
| `duaRegistrationDate` | Date                      | No          | DUA registration date |

**Prices and values**

| Field               | Type   | Required | Description                   |
| ------------------- | ------ | -------- | ----------------------------- |
| `publishedPriceCRC` | Number | Yes      | In colones, for catalog       |
| `finalSalePriceCRC` | Number | No       | Actual sale price (when sold) |
| `purchaseValueUSD`  | Number | Yes      | What Juan Carlos paid in USA  |
| `invoiceValueUSD`   | Number | Yes      | Lower invoice amount (USD)    |

**Ownership and statuses**

| Field            | Type                  | Required | Description                                                                |
| ---------------- | --------------------- | -------- | -------------------------------------------------------------------------- |
| `owner`          | String                | Yes      | `MBV`, `Dave`, `Client`. Default: `MBV`                                    |
| `assignedClient` | ObjectId (ref `User`) | No       | If owner = Client                                                          |
| `logisticStatus` | String                | Yes      | `In transit`, `In warehouse`, `Dekra pending`, `Available for direct sale` |
| `availability`   | String                | Yes      | `Available`, `Reserved`, `Under repair`, `Sold`                            |

**Mileage**

| Field             | Type   | Required | Description               |
| ----------------- | ------ | -------- | ------------------------- |
| `actualMileage`   | Number | Yes      |                           |
| `adjustedMileage` | Number | No       | Shown to client if exists |

**Images**

| Field    | Type            | Required | Description                                |
| -------- | --------------- | -------- | ------------------------------------------ |
| `images` | Array of String | No       | Cloudinary URLs, max 8. Deleted when sold. |

**Technical specifications**

| Field          | Type   | Required | Description                                                                    |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------ |
| `fuelType`     | String | Yes      | E.g., Gasoline, Diesel                                                         |
| `engine`       | String | Yes      | E.g., "2,400"                                                                  |
| `transmission` | String | Yes      | `Manual`, `Automatic`                                                          |
| `drivetrain`   | String | Yes      | `Front`, `Rear`, `4x4`                                                         |
| `color`        | String | Yes      |                                                                                |
| `description`  | String | No       |                                                                                |
| `bodyType`     | String | Yes      | `SUV`, `Sedan`, `Pick-up`, `Hatchback`, `Coupe`, `Convertible`, `Van`, `Other` |

**Logistic dates (optional, updated when status changes)**

| Field                  | Type | Required | Description |
| ---------------------- | ---- | -------- | ----------- |
| `departureFloridaDate` | Date | No       |             |
| `warehouseArrivalDate` | Date | No       |             |
| `dekraPendingDate`     | Date | No       |             |
| `availableForSaleDate` | Date | No       |             |
| `repairDate`           | Date | No       |             |

**Relationships and audit**

| Field          | Type                           | Required | Description         |
| -------------- | ------------------------------ | -------- | ------------------- |
| `expenses`     | Array (ObjectId ref `Expense`) | No       |                     |
| `creationDate` | Date                           | Yes      | Default: `Date.now` |
| `updateDate`   | Date                           | Yes      | Default: `Date.now` |

### 5. DaveCar (`DaveCar`) – only for accounting control

| Field                 | Type   | Required    | Description                               |
| --------------------- | ------ | ----------- | ----------------------------------------- |
| `vin`                 | String | Yes, unique |                                           |
| `dua`                 | String | Yes, unique |                                           |
| `brand`               | String | Yes         | Free text                                 |
| `model`               | String | Yes         | Free text                                 |
| `year`                | Number | Yes         |                                           |
| `color`               | String | Yes         |                                           |
| `duaRegistrationDate` | Date   | No          |                                           |
| `owner`               | String | Yes         | Default: `Dave`                           |
| `availability`        | String | Yes         | `Available`, `Sold`. Default: `Available` |
| `creationDate`        | Date   | Yes         | Default: `Date.now`                       |

### 6. Expense (`Expense`) – associated with a car

| Field              | Type                 | Required | Description                                                                                                                                                                                                                                                                       |
| ------------------ | -------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `car`              | ObjectId (ref `Car`) | Yes      |                                                                                                                                                                                                                                                                                   |
| `type`             | String               | Yes      | Enum: `Car purchase`, `Inspection`, `Tow truck`, `Mileage adjustment in USA`, `Mileage adjustment in CR`, `Taxes`, `Warehouse`, `VAT`, `Seller commission`, `Car registration`, `Fuel`, `Spare parts`, `Repairs`, `Shipping line`, `Other Juan Carlos expenses`, `Other expenses` |
| `description`      | String               | No       |                                                                                                                                                                                                                                                                                   |
| `amount`           | Number               | Yes      |                                                                                                                                                                                                                                                                                   |
| `currency`         | String               | Yes      | `USD`, `CRC`                                                                                                                                                                                                                                                                      |
| `expenseDate`      | Date                 | Yes      | Actual expense date (entered by admin)                                                                                                                                                                                                                                            |
| `receipt`          | String               | No       | Cloudinary URL                                                                                                                                                                                                                                                                    |
| `isFromJuanCarlos` | Boolean              | Yes      | `true` if it's an expense from JC                                                                                                                                                                                                                                                 |
| `createdAt`        | Date                 | Yes      | Default: `Date.now`                                                                                                                                                                                                                                                               |

**Rule:** When creating a car, expenses of type `Shipping line`, `Inspection` and `Tow truck` are automatically created.

### 7. GeneralExpense (`GeneralExpense`) – company expenses without a car

| Field         | Type   | Required | Description         |
| ------------- | ------ | -------- | ------------------- |
| `concept`     | String | Yes      |                     |
| `amount`      | Number | Yes      |                     |
| `currency`    | String | Yes      | `USD`, `CRC`        |
| `expenseDate` | Date   | Yes      |                     |
| `receipt`     | String | No       | Cloudinary URL      |
| `description` | String | No       |                     |
| `createdAt`   | Date   | Yes      | Default: `Date.now` |

### 8. JCPayment (`JCPayment`) – payments to Juan Carlos

| Field               | Type                       | Required | Description                     |
| ------------------- | -------------------------- | -------- | ------------------------------- |
| `amount`            | Number                     | Yes      | In USD                          |
| `actualPaymentDate` | Date                       | Yes      | Cannot be in the future         |
| `registrationDate`  | Date                       | Yes      | Default: `Date.now` (automatic) |
| `concept`           | String                     | No       |                                 |
| `associatedCars`    | Array (ObjectId ref `Car`) | No       | Can cover several cars or none  |
| `receipt`           | String                     | No       | Cloudinary URL                  |
| `transferReference` | String                     | No       |                                 |
| `createdBy`         | ObjectId (ref `User`)      | Yes      | Admin or superadmin             |
| `updatable`         | Boolean                    | Yes      | Default: `true`                 |

### 9. ClientPayment (`ClientPayment`) – client payments to MBV for commissioned cars

| Field            | Type                  | Required | Description          |
| ---------------- | --------------------- | -------- | -------------------- |
| `client`         | ObjectId (ref `User`) | Yes      |                      |
| `car`            | ObjectId (ref `Car`)  | Yes      |                      |
| `amount`         | Number                | Yes      | In colones (CRC)     |
| `paymentDate`    | Date                  | Yes      |                      |
| `paymentMethod`  | String                | No       | E.g., Transfer, Cash |
| `pendingBalance` | Number                | No       | Optional             |
| `receipt`        | String                | No       | Cloudinary URL       |
| `createdBy`      | ObjectId (ref `User`) | Yes      | Admin who records it |
| `createdAt`      | Date                  | Yes      | Default: `Date.now`  |

### 10. ExchangeRate (`ExchangeRate`) – manual USD → CRC conversion

| Field        | Type                  | Required | Description                |
| ------------ | --------------------- | -------- | -------------------------- |
| `value`      | Number                | Yes      | How many colones per 1 USD |
| `updateDate` | Date                  | Yes      | Default: `Date.now`        |
| `updatedBy`  | ObjectId (ref `User`) | No       | Admin who updated it       |

### 11. CompanyBalance

| Campo            | Tipo                  | Requerido | Descripción                                                                                            |
| ---------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------ |
| `initialAmount`  | Number                | Sí        | Monto inicial en colones (CRC) configurado por la empresa.                                             |
| `currentBalance` | Number                | Sí        | Balance actual calculado automáticamente a partir del monto inicial, menos egresos, más ingresos.      |
| `lastUpdated`    | Date                  | Sí        | Fecha del último cambio en el saldo (automático).                                                      |
| `updatedBy`      | ObjectId (ref `User`) | No        | Usuario que modificó por última vez el monto inicial o quien provocó la última transacción (opcional). |

---

### Notas importantes sobre los modelos

- **Ganancia por auto** (cálculo virtual):  
  `gananciaCRC = (precioVentaFinalCRC || 0) - (suma de gastos directos del auto convertidos a CRC usando el último TipoCambio)`.

- **Eliminación de imágenes**: Al cambiar `disponibilidad` a `"Vendido"`, se eliminan las imágenes de Cloudinary y se vacía el array `imagenes`. Si se revierte, el admin debe volver a subirlas.

- **Creación automática de gastos**: Al crear un auto, el resolver debe crear tres documentos `Gasto` con tipos `Naviera`, `Revisión`, `Grúa`. El admin proporciona monto, moneda y fecha. `esDeJuanCarlos` es `false` para Naviera, `true` para Revisión y Grúa.

- **Autos por encargo**: Un cliente puede tener múltiples autos (`dueño = "Cliente"` y `clienteAsignado`). Se consultan filtrando `Auto`.

- **Reporte para contadora**: Se genera en PDF desde el frontend usando `Auto` y `AutoDave`, filtrando por `fechaRegistroDUA` dentro del mes seleccionado. Se debe distinguir si es de MBV o Dave (por separación de colecciones o campo virtual).

## 1. INTRODUCCIÓN Y CONTEXTO DE LA EMPRESA

Importaciones MBV vende autos importados desde Florida (EE. UU.) a Costa Rica (CR).  
Dos métodos de venta:

- Venta directa: autos que la empresa trae por su cuenta para vender en CR.
- Venta por encargo: un cliente elige y encarga un auto específico; la empresa lo importa.

Todas las gestiones con clientes se realizan por WhatsApp.

## 2. TECNOLOGÍAS OBLIGATORIAS

- MERN (MongoDB, Express, React, Node.js)
- Vite (build tool)
- GraphQL (API)
- Tailwind CSS (estilos)
- JWT (autenticación)
- Cloudinary (gestión de imágenes)

## 3. REQUISITOS TRANSVERSALES DE CALIDAD

- Responsividad 100%
- Seguridad alta (JWT, validaciones, protección de rutas)
- Rendimiento y velocidad óptimos
- Código sin errores, buenas prácticas, imports organizados, estructura de proyecto correcta
- UI moderna, animaciones atractivas, navegación intuitiva, cada cosa en su lugar
- Optimización de Cloudinary para ahorrar memoria y mostrar imágenes correctamente

## 4. ROLES Y PERMISOS

**Superadmin**: acceso total a todo el sistema, CRUD de todos los usuarios y de toda la información.

**Admin**: CRUD de todo excepto de otros admins o del superadmin. Sí puede hacer CRUD de clientes y gestionar su propia cuenta.

**Cliente**:

- Puede ver el catálogo de autos disponibles.
- Puede registrarse y gestionar su cuenta (cambio de contraseña, etc.).
- Si tiene un auto por encargo, tiene un apartado "Mis autos" para ver el estado logístico de su auto, la información del auto (según lo permitido) y los pagos realizados.
- Solo puede ver ciertos campos del auto (detallado en sección 9.5).

**Punto a destacar**

- Todos los usuarios podran recuperar su contraseña a traves del correo en caso de haberla olvidado.

## 5. MODELO DE DATOS – AUTOS

### 5.1 Auto (para autos de MBV: venta directa o encargo). Campos obligatorios:

- Marca, modelo, número de VIN, número de DUA, año.
- Fecha de compra, fecha de venta.
- Precio (actual o final de venta).
- Valor de compra del auto (lo paga Juan Carlos, en USD es lo que costo el auto en USA).
- Valor de factura (un monto menor, con el que Juan Carlos lo pasa o revende a MBV, solo para registro).
- Fecha de registro DUA.
- Dueño: puede ser MBV, Dave o un cliente (auto por encargo).
- Estado logístico (ver 5.2).
- Disponibilidad (ver 5.3).
- Millaje real, millaje ajustado.
- Imágenes (subidas a Cloudinary).
- Tipo de combustible, motor (ejemplo: 2,400, 1,800), transmisión, tracción, color, descripción, carrocería (SUV, sedán, pick-up, etc.).

**Fechas específicas para control de tiempo logístico**:

- Fecha de cuándo salió en camino de Florida a CR.
- Fecha de cuándo se marcó en el almacén.
- Fecha de cuándo se marcó con Dekra pendiente.
- Fecha de cuándo se marcó como disponible para venta directa.
- Fecha de cambio de disponibilidad a "en reparación" (solo si aplica).

**Cálculo de ganancia por auto (visible solo para admin)**:

- Ganancia = Precio de venta final (registrado por admin al vender el auto) menos los gastos totales del auto.
- Si el auto no se ha vendido, precio de venta = 0 → ganancia negativa.
- La ganancia puede ser positiva o negativa.

### 5.2 Estados logísticos (proceso de importación)

- En camino (de Florida a CR)
- En almacén (llegó a CR)
- Dekra pendiente
- Disponible para venta directa

(Nota: "en reparación" y "vendido" NO son estados logísticos, son de disponibilidad)

### 5.3 Disponibilidad (estado comercial del auto)

- Disponible
- Reservado
- En reparación
- Vendido

### 5.4 Autos de Dave (solo para control contable)

- No tienen nada que ver con gastos de MBV ni con Juan Carlos.
- Son más básicos: solo tienen número de VIN, número de DUA, marca, modelo, año y color.
- Sirven para que la contadora tenga el reporte de todos los autos a nombre de la empresa (incluyendo los de Dave).

## 6. GESTIÓN DE GASTOS

### 6.1 Tipos de gasto y su moneda

**Gastos relacionados con Juan Carlos (en dólares)**:

- Compra del auto, revisión, grúa, ajuste de millas en USA, otros gastos de Juan Carlos.

**Gastos no relacionados con Juan Carlos (en colones)**:

- Impuestos, almacén, ajuste de millas en CR, IVA, comisión del vendedor, inscripción del auto, combustible, repuestos, reparaciones, otros gastos.

- Cada gasto está ligado a un auto concreto (excepto los gastos generales de empresa).
- Cada gasto puede tener una descripción opcional.

### 6.2 Gastos generales de empresa (no ligados a ningún auto)

- Pago a contadora, comisiones bancarias, publicidad, renta anual, otros impuestos, viáticos, etc.

### 6.3 Regla al crear un auto

- Cuando se crea un auto, se deben crear automáticamente los gastos correspondientes a ese auto, de los cuales son **obligatorios**: naviera, revisión y grúa.
- Los demás gastos son opcionales, pero también se podrán registrar allí mismo.

### 6.4 Conversión de moneda

- Todos los datos estadísticos finales (ganancia, total de todos los gastos existentes juntos, etc.) deben estar en **colones**.
- El sistema debe permitir establecer manualmente el tipo de cambio del dólar.

### 6.5 Gestion a varios autos

- El admin puede gestionar varios autos a la vez para cambiar su estado logstico, disponibilidad, asignar fecha de registro DUA, eliminar y demas gestiones que creas que se puedan hacer en masa para los autos

## 7. CONTROL DE PAGOS A JUAN CARLOS (JC)

- La empresa tiene un socio en Florida (Juan Carlos) que compra los autos, los revisa, paga grúa, ajuste de millas en USA y otros gastos. Se le debe devolver ese dinero.
- Necesitamos visibilidad de **cuánto le debemos en total** y **cuánto por cada auto** (desglose de gastos por auto).

**Funcionalidades del apartado para control con JC**:

- Ver cuánto ha invertido JC.
- Ver en qué ha invertido (desglose por auto).
- Ver cuánto se le debe y cuánto se le ha pagado.
- Desglose completo y organizado, con fechas.
- Poder buscar y filtrar todo lo posible.
- Los pagos a JC tienen una **fecha de pago realizada** que se coloca manualmente (porque el pago se pudo haber hecho dos días antes, aunque se registre hoy).

**Importante**: Este apartado es independiente de los gastos generales, porque hay gastos que son de JC y otros que no.

## 8. PANEL ADMINISTRATIVO – MÓDULOS

### 8.1 Catálogo público (visible para clientes registrados y no registrados)

- Ver autos disponibles (solo los que tienen disponibilidad = Disponible).
- Ver marcas y modelos disponibles.
- Buscar autos por marca, modelo o año.
- Filtrar por: marca, modelo, carrocería, transmisión, tracción, año, rango de precio, color, estado logístico.

### 8.2 Dashboard estadístico

- Muy completo, con todas las estadísticas financieras, de estado logístico, disponibilidad y cualquier otra cosa contabilizable.
- Bien organizado, atractivo a la vista, con opción de filtros en todo lo posible.
- Todos los datos finales en colones.

### 8.3 Registro de clientes

- Los clientes pueden registrarse ellos mismos.
- También los administradores pueden registrar clientes manualmente (porque las solicitudes de encargo llegan por WhatsApp).
- Tipos de clientes: los que compraron un auto directo, los que solicitaron un auto por encargo, o clientes normales sin auto.

### 8.4 Gestión de autos (CRUD)

- Al crear un auto: se ingresan todos los campos necesarios (los de 5.1), incluyendo imágenes.
- Se crean automáticamente los gastos obligatorios (naviera, revisión, grúa). Los opcionales se pueden añadir allí mismo.
- En los campos de marca y modelo, si el valor no está en el select, se debe poder crear desde allí mismo.
- Editar auto.
- Subir y gestionar imágenes (Cloudinary).
- Opción de descargar todas las imágenes de un auto.
- **Venta de un auto**:
  - El admin registra el precio final de venta (puede ser igual, mayor o menor al precio actual del auto).
  - Una vez vendido, se eliminarán automáticamente sus imágenes de Cloudinary (para no consumir memoria). Las imágenes no son obligatorias al crear el auto precisamente por esto.
  - El registro del auto queda en el histórico.
- Visualización de ganancia por auto (solo admin): precio de venta final menos gastos totales. Si no hay venta, ganancia negativa.

### 8.5 Calculadora de auto (sin guardar)

- Permite calcular la ganancia cambiando el precio de venta.
- Se indica un precio nuevo y se restan los gastos actuales más otros gastos que se puedan agregar manualmente (ejemplo: naviera, grúa y revisión ya existen, pero faltan otros; se escriben manualmente solo para el cálculo).
- Esto no guarda el auto, solo es una simulación.

### 8.6 Clientes con auto por encargo – "Mis autos"

- Los clientes que han pedido un auto por encargo tienen un apartado para ver el estado logístico de su auto, toda la información correspondiente del auto y los pagos realizados.

### 8.7 Filtrado por fechas

- Todos los datos (gastos, pagos, autos, etc.) deben poder gestionarse o visualizarse por rangos de fechas.

## 9. INTERFAZ DE USUARIO Y NAVEGACIÓN

### 9.1 Navbar (logo en src/assets)

Debe incluir:

- Inicio
- Catálogo (lleva a la parte de abajo donde está el catálogo en home)
- Marcas
- Modelos
- Redes sociales: Instagram, WhatsApp, Facebook, TikTok (las URLs estarán en el archivo .env)
- Iniciar sesión
- Admin panel (según rol)
- Mi cuenta
- Mis autos (solo para clientes que tienen auto por encargo)
- Cerrar sesión

### 9.2 Landing page

- Hero muy bonito y especial para home.
- Debajo del hero, el catálogo correspondiente.
- Footer bien organizado.

### 9.3 Card de auto (vista resumen)

- Muestra la información correspondiente.
- Para clientes (no admin): dos botones:
  - Consultar a la empresa por WhatsApp (con mensaje predefinido, bien estructurado y completo). Este botón No se muestra a los admin.
  - Compartir el auto.

### 9.4 Vista de detalle del auto

- Muestra toda la información del auto permitida según el rol.

### 9.5 Lo que el cliente puede ver de un auto

- Millaje ajustado (si existe; si no, millaje real).
- Marca, modelo, año, precio, estado logístico, imágenes, combustible, motor, transmisión, tracción, color, descripción, carrocería.
- **No puede ver**: VIN, DUA, fechas internas (compra, venta, etc.), valor de compra, valor de factura, dueño, etc.

## 10. REGLAS ADICIONALES IMPORTANTES

- Los gastos relacionados con Juan Carlos son en dólares; el resto de los gastos son en colones. Pero todos los datos estadísticos finales (ganancia, total de gastos, etc.) se muestran en colones, usando el tipo de cambio que se pueda establecer manualmente.
- Las imágenes de los autos no son obligatorias al crear el auto (porque al vender se eliminan). Una vez vendido, se eliminan de Cloudinary para ahorrar memoria, pero el auto sigue en el histórico.
- Opción de descargar todas las imágenes de un auto mientras no esté vendido.
- Los autos de Dave no tienen relación con gastos de MBV; solo existen para reporte contable.
- El reporte para la contadora debe incluir todos los autos a nombre de la empresa (MBV y Dave). Para control interno se debe poder visualizar cuáles son de MBV, cuáles de Dave y cuáles son encargados por clientes.
- Cada usuario tiene un apartado para gestionar su cuenta en totalidad, incluyendo cambio de contraseña.

## 11. REQUISITOS NO FUNCIONALES (RECORDATORIO)

- El sistema no debe tener ningún tipo de error.
- Todo el código debe estar bien organizado, con imports correctos y estructura de proyecto correcta.
- Excelente seguridad, rendimiento y velocidad.
- Moderno, con animaciones atractivas y completamente responsivo.

## 12. MONTO INICIAL DE LA EMPRESA (CONTROL DE CAJA)

Para que la empresa pueda tener una referencia del efectivo disponible, se llevará un registro de un **monto inicial** que se ingresa una vez el sistema esté listo. A partir de éste, se reflejarán automáticamente las deducciones y adiciones según los movimientos que realmente afectan la caja.

### 12.1 Reglas de afectación

- **Reducen el monto (egresos reales):**
  - Todos los **gastos no relacionados con Juan Carlos** (gastos en CRC de cada auto y gastos generales de empresa).
  - Los **pagos a Juan Carlos** (registrados en la colección `JCPayment`). Los gastos asociados a JC (`Expense` con `isFromJuanCarlos = true`) **no** reducen el monto en el momento de crearse, porque aún no han salido de la caja de MBV; solo lo harán cuando se registre el pago correspondiente a JC.
- **Aumentan el monto (ingresos reales):**
  - Cualquier ingreso monetario, principalmente las ventas de autos (precio final de venta). Pueden considerarse otros ingresos si se registran.
  - Los movimientos que afectan el balance se aplican en el momento de crear, editar o eliminar los documentos correspondientes (gastos no JC, pagos a JC, ventas), manteniendo la integridad.

### 12.2 Edición del monto inicial

- El monto inicial puede editarse en cualquier momento por un administrador o superadministrador.
- **Cambiar el monto inicial no recalcula ninguna operación pasada.** Simplemente se actualiza la cifra de referencia, ajustando el balance actual en la misma cantidad.

### 12.3 Ubicación en el sistema

- El balance se muestra únicamente en el panel administrativo (dashboard).
- No afecta los cálculos de ganancia por auto ni ningún otro reporte, es solo una herramienta de control interno.

---

**Nota para insertar en `Plan.md`:**  
Agregar toda esta sección (13. MONTO INICIAL DE LA EMPRESA) después de la sección **12. PREGUNTAS Y ACLARACIONES** y antes del **FIN DEL DOCUMENTO**. En la estructura de modelos, añadir el modelo `CompanyBalance` después del modelo `ExchangeRate`. No requiere cambios en otros modelos.

## 13. PREGUNTAS Y ACLARACIONES

- P/ ¿El cliente necesita confirmar su cuenta por email o puede usarla inmediatamente después de registrarse?
- R/ Pude usarla inmediatamente, ya que no se neceista notificar nada al correo del cliente

- P/ ¿Un cliente puede tener múltiples autos por encargo? ¿Hay un límite máximo?
- R/ Si, no hay un limite maximo.

- P/ ¿El campo precio del auto (precio actual o final) está en USD o CRC? El documento sugiere que todo lo relacionado con compra/venta es en USD, ¿correcto?
- R/ Todos los gastos relacionados a Juan Carlos son en USD, todo el resto de cosas deben de ser en CRC.

- P/ ¿La fecha de compra se refiere a cuándo MBV compró el auto en USA o cuándo el cliente lo compró (si es venta directa)?
- R/ Se refiere a cuando se compro en USA

- P/ ¿La fecha de venta se registra automáticamente al marcar el auto como vendido? ¿Se puede modificar después?
- R/ Se registra al marcar como vendido, pero se digita manual, ya que se puede colocar vendido ese dia, pero en realidad se vendio 2 dias antes

- P/ ¿El millaje ajustado es opcional, pero si existe, ¿el cliente ve ese en lugar del millaje real? ¿En qué casos se usa el ajustado?
- R/ El millaje ajustado es el que veran los clientes solo en caso de que exista, si no hay ajustado se muestra el real

- P/ Las fechas específicas de logística (salida Florida, llegada almacén CR, Dekra pendiente, disponible venta, en reparación): ¿Todas son obligatorias al crear el auto o se van registrando con el tiempo? ¿Quién las actualiza (admin solamente)?
- R/ Se van registrando con el tiempo, al ir marcando el estado logistico de cada auto, solo las actualiza el admin o superadmin

- P/ ¿El estado Dekra pendiente es un estado logístico independiente o es un subestado dentro de "En almacén"?
- R/ Es independiente

- P/ Cuando un auto se marca como Vendido, ¿pasa automáticamente a ese estado desde cualquier estado anterior? ¿Se puede desmarcar "Vendido" para revertirlo?
- R/ Si, pasa a ese estado desde cualquier estado anterior y si se puede revertir pero las imagenes ya han sido elimnidas, por lo tanto el admin las debe volver a agregar manualmente

- P/ ¿Los autos de Dave aparecen en alguna vista del panel administrativo? ¿Deben tener un listado separado o un filtro especial?
- R/ Si, debe de tener un listado separado

- P/ ¿Los autos de Dave pueden tener imágenes o gastos asociados? El documento dice "solo control contable", ¿significa que no?
- R/ No, son solo para control, no necesitan imagenes ni relacion con gastos

- P/ ¿En el reporte para contadora, los autos de Dave deben aparecer mezclados con los de MBV o en una sección separada?
- R/ Si estan mezclados deben de diferenciarse o identificarse como de dave o si no entonces en una seccion separada

- P/ Los gastos obligatorios al crear un auto son: naviera, revisión, grúa. ¿Estos gastos tienen montos por defecto o el admin debe ingresar el valor manualmente al crear el auto?
- R/ El admin debe ingresar el valor manualmente, son obligatorios

- P/ Los "otros gastos de JC" y "otros gastos no relacionados con JC": ¿Se pueden agregar en cualquier momento después de crear el auto? ¿O solo en el momento de creación?
- R/ Todos los gastos se pueden agregar y editar en cualquier momento, excepto cuando el auto esta vendido, incluso los obligatorios se pueden editar despues, en caso de necesitarlo

- P/ ¿Los gastos tienen una fecha asociada (fecha en que ocurrió el gasto)? ¿Esa fecha la ingresa el admin manualmente?
- R/ Si, excatamente, el admin ingresa la fecha cuando registra el gasto, solo los obligatorios si se ingresan por primera vez con la fecha de creacion automatica

- P/ Para los gastos en CRC (impuestos, almacén, etc.), ¿se requiere número de factura o comprobante? ¿Se puede subir un archivo/imagen del comprobante a Cloudinary?
- R/ Si se sube una imagen a clodinary pero de forma opcional

- P/ ¿Los gastos generales de empresa (contadora, publicidad, etc.) se crean en un módulo aparte? ¿Quién los crea? ¿Tienen también fecha y comprobante?
- R/ Como lo veas mas factible, y si tambien pueden tener imagen de comprobante de forma opcional

- P/ ¿El "total invertido por JC" se calcula automáticamente sumando todos los gastos marcados como "Relacionados con Juan Carlos"? ¿O el admin ingresa ese total manualmente?
- R/ Si, todo automatico, pero recordar que hay filtraciones por fecha para ver los gastos y demas

- P/ ¿Qué campos debe tener cada pago a JC? Propuesta: monto (USD), fecha real del pago, fecha de registro en sistema, concepto, auto asociado (opcional), comprobante (imagen), referencia de transferencia.
- R/ Esos campos estan bien, solo que el concepto, el comprobante (imagen) es opcional y la referencia de transferencia tambien es opcional, la fecha de registro del sistema es automatica correspondiente a la fecha actual

- P/ ¿Un pago a JC puede cubrir gastos de múltiples autos? Por ejemplo, JC paga $5000 por dos autos diferentes. ¿Cómo se distribuye?
- R/ Dsitribuyelo como tu creas que sea la mejor forma, diria como idea que se puden seleccionar que autos corresponden, pero por favor hazlo como tu creas mejor

- P/ ¿El historial de pagos permite editar o eliminar un pago ya registrado? ¿Quién puede hacerlo?
- R/ Si, solo los admin o superadmin

- P/ ¿Se requiere que el admin ingrese manualmente la fecha real del pago aunque sea diferente a la fecha de registro? ¿Qué pasa si ingresa una fecha futura por error?
- R/ No se permite ingresar una fecha posterior a la fecha actual

- P/ El catálogo público muestra solo autos con disponibilidad = "Disponible". ¿Los autos "En reparación" o "En camino" NO se muestran? ¿Correcto?
- R/ Te explico, solo los autos con disponibilidad = disponible se muestran a los clientes, sin importar su estado logistico, es decir un auto puede estar en camino o almacen, que si tiene disponibilidad = disponible se muestra a los clientes, pero si tiene cualquier otra disponibilida no se muestra

- P/ ¿Los autos por encargo (asignados a un cliente) aparecen en el catálogo público si están disponibles para venta directa? ¿O solo los que son propiedad de MBV?
- R/ No se muestran al publico, solo al cliente dueño en su seccion de autos, ya que el auto va a estar con dispomibilidad reservado

- P/ ¿Qué gráficos o métricas específicas debe mostrar el dashboard? (ganancias por mes, autos vendidos por marca, gastos por categoría, autos por estado logístico, etc.)
- R/ Se deben mostrar todos los graficos o metricas posibles de nivel financiero, logistico, inventario, etc. Es decir estadisticas de todo lo posible, un dashboard o dashboards bien completos.

- P/ ¿El dashboard debe actualizarse en tiempo real o con un botón de "refrescar"?
- R/ Si se puede hacer un refetchQueries para que sea automatico seria genial, pero si no con el boton de refrescar esta bien, como lo veas mas factible

- P/ ¿El admin puede filtrar el dashboard por rango de fechas? ¿Ese filtro aplica a todas las métricas simultáneamente?
- R/ Si claro, se necesita poder filtrar por fechas

- P/ Además de registrar clientes manualmente, ¿el admin puede ver qué clientes se autorregistraron? ¿Puede convertirlos a "comprador directo" o "solicitante de encargo"?
- R/ Si, seria muy bueno eso

- P/ ¿El admin puede asignar un auto a un cliente (encargo) desde el perfil del cliente o desde la ficha del auto?
- R/ Si eso esta excelente

- P/ Al crear un auto, si el admin selecciona que es "por encargo", ¿debe seleccionar obligatoriamente a qué cliente pertenece? ¿O puede dejar el cliente vacío y asignarlo después?
- R/ Puede dejarlo vacio y asignarlo despues

- P/ ¿El admin puede crear clientes manualmente con los mismos campos que el autorregistro? ¿Puede asignarles una contraseña temporal?
- R/ Si claro, con una contrasña temporal para que el cliente pueda acceder despues

- P/ En marca/modelo, si no existe en el select, se permite crearlo. ¿Esa nueva marca/modelo queda guardada para futuros autos? ¿Quién puede crear marcas/modelos (solo admin)?
- R/ Si queda guardada en las marcas o modelos, para autos futuros, admin y superadmin

- P/ La subida de imágenes: ¿cuántas imágenes máximo puede tener un auto? ¿Tamaño máximo por imagen? ¿Formatos aceptados?
- R/ 8 imagenes maximo, 8mb maximo cada una, jpeg - jpg - png - webp

- P/ Al marcar un auto como vendido, además de eliminar imágenes: ¿Se debe registrar el nombre del comprador? ¿Se debe generar una factura o comprobante?
- R/ Si se puede registrar el comprado de forma opcional, no se debe de genrar ninguna factura o comprobante

- P/ ¿El precio de venta final puede ser menor al precio actual? ¿Menor al valor de compra? (asumiendo pérdida)
- R/ Si, puede ser menor, se puede asumir perdida

- P/ ¿La ganancia mostrada considera también los gastos generales de empresa prorrateados? ¿O solo los gastos directos del auto?
- R/ Solo los directos del auto, los de la empresa son solo para teener visualizacion, pero los manejamosde forma distinta como empresa

- P/ ¿Se muestra la ganancia en USD o CRC? El documento dice "datos finales en colones", ¿aplica también a ganancia por auto?
- R/ Si, todo es en colones excepto lo relacionado con Juan Carlos

- P/ ¿La calculadora permite simular también cambiar el tipo de cambio o usa el actual del sistema?
- R/ Usa el del sistema

- P/ Además del estado logístico, ¿el cliente puede ver fechas estimadas (ej. "llegada estimada a CR")? ¿O solo el estado textual?
- R/ Solo el estado textual, siempre bien bonito todo con un timeline, pero sin fechas estimadas

- P/ ¿Los pagos que ve el cliente son los pagos que ÉL ha hecho a MBV? ¿Qué información se muestra: monto, fecha, saldo pendiente, método de pago?
- R/ Así es, pero esos pagos los registra el admin o superadmin, ya que el cliente los hace directamente con la empresa, no en el sistema, se muestra justo esa informacion que menionas.

- P/ ¿El cliente puede solicitar un cambio de estado o hacer alguna acción desde "Mis autos" (ej. "marcar como listo para entregar")? ¿O solo es consulta?
- R/ No, toda la gestion del estado logistico o disponibilidad la pueden hacer solo admin o superadmin

- P/ "Marcas" y "Modelos": ¿estos enlaces llevan a páginas que listan todas las marcas/modelos con autos disponibles? ¿O llevan a secciones en el home?
- R/ A paginas que listan, siempre todo bien bonito y ordenado y es necesario con paginacion, de hecho es necesario que se integre una paginacion para los autos y demas partes del sistema que la necesiten

- P/ "Mis autos": ¿este enlace solo aparece si el cliente tiene al menos un auto por encargo? ¿O aparece siempre y si no tiene muestra un mensaje?
- R/ Solo si tiene autos y si no, no se muestra la opcion simplemente

- P/ El botón "Consultar por WhatsApp": ¿qué número de teléfono se usa? ¿Está fijo en .env o varía según el auto (ej. vendedor asignado)?
- R/ Esta en el .env como VITE_WHATSAPP

- P/ El mensaje predefinido completo: ¿Debe incluir el precio actual del auto? ¿La ubicación (CR)? ¿El estado logístico?
- R/ Debe incluir los datos mas relevantes, los que creas necesarios, el de la ubicacion no

- P/ Para el cliente: ¿puede ver todas las imágenes del auto o solo una principal? ¿Puede ampliarlas?
- R/ Si ve todas las imagenes en un carousel de imagenes bien bonito, moderno y con buenas animaciones y si puede ampliar las imagenes

- P/ Para el admin: ¿en el detalle del auto aparecen también los gastos asociados y la ganancia calculada? ¿O es solo un módulo separado?
- R/ Como creas mejor, si se puede y no crea ningun incoveniente esta genial, pero si no como creas mejor hacerlo

- P/ Además de los autos a nombre de la empresa, ¿el reporte debe incluir resumen financiero (total gastos, total ventas, ganancias)? ¿O solo listado de autos?
- R/ Solo listado de autos, pero recuerda, con marca, modelo, diferenciacion entre dave o mbv, vin, dua, fecha registro dua y disponibilidad, a la contadora se le entragn los resportes mensualmente, por lo tanto solo los autos correspondientes al mes, la fecha que se toma en cuenta para esto, es la del registro de dua, que es opcional ese campo

- P/ ¿El reporte se genera desde el frontend (botón que descarga) o el backend envía el archivo? ¿Qué formatos exactos: CSV, Excel, PDF?
- R/ Se descarga el reporte desde el front end en formato pdf, o bien puede tambien ser posible si lo ves factible que este listado este en otro apartado, para que la contadora pueda verlo con una cuenta de admin, pero como creas mejor hacerlo, con la descarga esta genial tambien

- P/ ¿El admin puede filtrar el reporte por año o rango de fechas antes de generarlo?
- R/ Si el reporte se debde de poder filtrar por fechas, principalmente por mes

- P/ Backups y recuperación: ¿El sistema debe tener algún mecanismo de backup automático de la base de datos? ¿O se asume que lo maneja MongoDB Atlas?
- R/ Se lo dejamos a Atlas

- P/ Logs / Auditoría: ¿Se debe registrar quién creó, editó o eliminó un auto, gasto o pago? ¿El superadmin puede ver un historial de acciones?
- R/ Si se puede esta muy bien, pero si lleva mucha cosa no es necesario

- P/ Despliegue: ¿El sistema se desplegará en un servidor específico (VPS, Railway, Render, AWS)? ¿Quién proporciona las credenciales de Cloudinary, MongoDB, etc.?
- R/ Si se despliegara el client en Vercer y el server en Render, todo estara proporcionado en las env, las imagenes en cloudinary y la bd en atlas igual todo en la env, y las env tambien las creare en el render envs y vercel envs una vez todo este listo para subir a la red

- P/ Soporte para múltiples empresas: ¿El sistema es solo para Importaciones MBV o podría reutilizarse para otras importadoras en el futuro?
- R/ Solo para MBV

**FIN DEL DOCUMENTO**
