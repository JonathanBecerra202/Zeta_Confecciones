# Zeta Confecciones

Sistema web para la gestión de clientes, pedidos y procesos administrativos de Zeta Confecciones, un emprendimiento dedicado a la confección de uniformes.

## 📌 Descripción

Zeta Confecciones permite centralizar y gestionar la información relacionada con:

- Clientes
- Organizaciones
- Dependencias
- Pedidos
- Medidas de clientes
- Abonos y pagos
- Auditoría de operaciones

Medidas, pedidos y abonos se gestionan directamente desde el detalle de cada cliente, en lugar de tener una pantalla independiente para cada uno — una decisión de diseño pensada para mantener pocas pantallas principales, cada una con una función clara y completa.

El sistema cuenta con control de acceso basado en roles para diferenciar las funciones disponibles para administradores y empleados.

## 🚀 Tecnologías

- Angular
- TypeScript
- Supabase
- PostgreSQL
- HTML5
- CSS3

## ✨ Características

- 🔐 Autenticación de usuarios
- 👥 Gestión de clientes
- 🏢 Gestión de organizaciones y dependencias
- 📦 Gestión de pedidos
- 📏 Registro de medidas (con historial por cliente)
- 💰 Gestión de abonos y saldos
- 🔎 Búsqueda tolerante a mayúsculas, minúsculas y acentos
- 📋 Registro de auditoría automático
- 🛡️ Control de permisos según el rol del usuario
- 📱 Interfaz adaptable

## 👤 Roles

**Administrador**
Cuenta con acceso a las funciones administrativas del sistema, incluyendo la gestión de organizaciones y dependencias, la modificación del precio de un pedido ya creado, la gestión de las cuentas de otros usuarios y la consulta de auditorías.

**Empleado**
Puede gestionar clientes, medidas, pedidos y abonos. No puede crear ni editar organizaciones o dependencias, modificar el precio de un pedido ya existente, ni acceder a la sección de Auditoría.

## 🗄️ Base de datos

La aplicación utiliza PostgreSQL mediante Supabase como sistema de almacenamiento. La base de datos incorpora restricciones, relaciones, triggers y políticas de seguridad (RLS) para mantener la integridad de los datos y controlar el acceso según el rol del usuario autenticado.

Toda operación de creación, edición o eliminación sobre las tablas principales queda registrada automáticamente en `audit_log` mediante triggers, sin intervención manual.

### Preparar la base de datos

En el SQL Editor de Supabase, ejecuta los scripts en este orden exacto (hay dependencias entre ellos):

1. `DDL.txt` — tipos, tablas, llaves foráneas y restricciones.
2. `TRIGGERS.txt` — funciones y triggers (incluye el de auditoría).
3. `RLS.txt` — seguridad a nivel de fila y políticas por rol.

Después, crea manualmente los roles (`Admin`, `Employee`) y vincula cada usuario de Supabase Auth a un perfil en la tabla `profile` con su rol correspondiente.

## 🔎 Búsqueda inteligente

El sistema incorpora una búsqueda tolerante que permite encontrar información sin depender estrictamente de:

- Mayúsculas o minúsculas
- Tildes
- Coincidencia exacta de palabras
- Orden de los nombres

Por ejemplo, una búsqueda como `jose perez` puede encontrar un registro almacenado como `José Pérez`.

## 📂 Estructura general

```text
ZetaConfProy/
└── zetaconf/
    ├── src/
    │   └── app/
    │       ├── core/
    │       ├── services/
    │       ├── shared/
    │       └── ...
    ├── angular.json
    ├── package.json
    └── ...
```

## ⚙️ Instalación

Clona el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
```

Entra al proyecto:

```bash
cd zetaconf
```

Instala las dependencias:

```bash
npm install
```

Ejecuta el proyecto:

```bash
ng serve
```

Luego abre:

```text
http://localhost:4200
```

## 🔑 Configuración

Antes de ejecutar el proyecto, crea el archivo `src/environments/environment.ts` con el siguiente contenido:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'TU_PROJECT_URL',
  supabaseKey: 'TU_ANON_KEY'
};
```

Estos valores se obtienen en el panel de Supabase, en **Settings → API** (Project URL y Publishable/anon key). No incluir claves privadas ni credenciales sensibles directamente en el repositorio.

## 📚 Proyecto académico

Proyecto desarrollado como parte de la formación en Ingeniería de Sistemas y aplicado a un caso real de gestión para Zeta Confecciones.

---

**Zeta Confecciones — Sistema de gestión**
