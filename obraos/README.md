## obraOS – Plataforma de control de obra

obraOS es una plataforma para gestionar proyectos de construcción a nivel de:

- **Proyectos** (presupuesto, unidades, equipo PM)
- **Bloques / Unidades** (fases, tareas, avance físico)
- **Recursos**:
  - **Materiales** (inventario, lotes, costo promedio)
  - **Planillas** (mano de obra / subcontratos por bloque)
  - **Costos varios / Servicios** (servicios unitarios que se asignan a tareas)

La aplicación está construida con **Next.js App Router**, **Prisma** y **MySQL**.

---

## 1. Arranque del proyecto

- **Desarrollo**

  ```bash
  npm install        # primera vez
  npm run dev        # http://localhost:3000
  ```

- **Variables de entorno básicas (`.env`)**

  - `DATABASE_URL` – conexión MySQL
  - Credenciales de NextAuth (GitHub/Email, etc.)

- **Base de datos**

  ```bash
  npx prisma migrate dev
  npx prisma studio
  ```

---

## 2. Conceptos clave de dominio

- **Proyecto**
  - Tiene `numUnidades`, `presupuestoObra`, ubicación, tipo (residencial, apartamentos, etc.).
  - Se estructura en **fases** y cada fase en **tareas**.
  - Se le asigna un **PM** y un equipo (módulo Equipo PM).

- **Unidad (Bloque)**
  - Representa una casa/apartamento/bloque dentro del proyecto.
  - Se crea desde:
    - `platform/proyectos/[id]/unidades` (vista de unidades)
    - o desde el **Control de Obra** al crear/editar bloque.
  - Atributos principales:
    - `etiqueta` (ej. “Casa 1”, “Apt 2A”)
    - `numero`
    - `fechaEntregaEstimada`
    - `pctAvanceGlobal`

- **Fase**
  - Catálogo de fases a nivel de proyecto (Movimiento de Tierra, Cimentación, Levantamiento de Muros, etc.).
  - Cada fase tiene orden, estado (`StatusEnum`), `pctAvance` y rango de fechas opcional.
  - Se usa para:
    - Organizar tareas.
    - Controlar qué partes 3D del modelo se muestran por fase (campo `partes3D` / `FaseParte3D`).

- **Tarea**
  - Elemento operativo dentro de una fase (Ej. “Excavación”, “Armado de hierro”, “Puntales”).
  - Campos:
    - `nombre`
    - `fechaInicio`, `fechaFin`
    - Metros cuadrados (`cantidadM2`) y metros cúbicos (`cantidadM3`) planeados.
    - Estado de completado **por unidad** (tabla `TareaCompletadaUnidad`).
  - Es el punto de enlace de recursos:
    - Materiales asignados
    - Planillas / Bloques de planilla
    - Servicios (Costos varios)

---

## 3. Vista Proyectos

Ruta: `/platform/proyectos`

- **Grid de proyectos** (`ProyectosGrid`):
  - Tarjetas con:
    - Nombre, tipo, ubicación
    - Número de unidades
    - Presupuesto total (formateado en Q / millones)
    - % de avance global del proyecto.
  - Cada tarjeta abre el detalle en `/platform/proyectos/[id]`.

- **Detalle de proyecto** (`/platform/proyectos/[id]`):
  - Resumen de:
    - Presupuesto por rubros
    - Avance por unidad
    - Avance por fase
  - Accesos:
    - Gestión de **unidades** (bloques)
    - Control de obra (abre visor filtrado al proyecto)

---

## 4. Control de Obra (Visor)

Ruta: `/platform/visor`

- **Selector de proyecto**:
  - Dropdown con proyectos activos.
  - Al seleccionar, carga:
    - Fases y sus tareas
    - Unidades activas del proyecto
    - Avance por fase/unidad.

- **ControlObraClient**
  - Muestra tarjetas/filas de **unidades** (bloques) con:
    - Etiqueta, número, % de avance
    - Estado por fase
  - Desde cada unidad se puede:
    - Abrir el **wizard de Bloque** (crear/editar fases y tareas)
    - Ir al detalle de unidad (`/platform/proyectos/[id]/unidades/[unidadId]`).

---

## 5. Wizard de Bloque (Unidades, Fases y Tareas)

Componente: `app/platform/visor/WizardCrearBloque.tsx`

Se utiliza tanto para **crear** como para **editar** un Bloque (unidad).

- **Modo creación**
  - **Paso 1: Fases**
    - Se listan las fases del catálogo (`/api/fases-catalogo`).
    - El usuario puede:
      - Agregar fases desde el catálogo.
      - Crear fases personalizadas.
    - Al hacer clic en “Siguiente → Paso 2”:
      - Se crean las fases nuevas vía `POST /api/fases`.
  - **Paso 2: Tareas**
    - Para cada fase elegida:
      - Lista de tareas con:
        - Nombre
        - Fecha inicio/fin (inputs `date`)
        - M² y M³
      - Botón `+ Tarea` para agregar filas.
    - Al guardar:
      - Se crea la **unidad** (`POST /api/unidades`).
      - Se crean las tareas (`POST /api/tareas`) asociadas a la fase correspondiente.

- **Modo edición**
  - El wizard se abre con:
    - Unidad existente (`etiqueta`, `fechaEntregaEstimada`)
    - Fases y tareas ya creadas para el proyecto.
  - **Paso 1: Fases (edición)**
    - Muestra las fases existentes como **inputs editables**:
      - Permite cambiar el nombre.
      - Permite quitar fases (se marcan para eliminación).
    - También se pueden agregar fases nuevas desde catálogo o personalizadas.
    - Al pasar al Paso 2:
      - Fases existentes editadas → `PATCH /api/fases/[id]`.
      - Fases marcadas como quitadas → `DELETE /api/fases/[id]` (incluye sus tareas/relaciones por cascada).
      - Nuevas fases seleccionadas → `POST /api/fases`.
  - **Paso 2: Tareas (edición)**
    - Las tareas existentes se cargan con:
      - Nombre
      - Fechas
      - M² y M³
    - El usuario puede:
      - Editar cada campo.
      - Agregar nuevas tareas por fase.
      - Eliminar tareas puntuales.
    - Al guardar:
      - Tareas con `id` → `PATCH /api/tareas/[id]`.
      - Tareas nuevas → `POST /api/tareas`.
      - La unidad se actualiza con:
        - `PATCH /api/unidades/[id]` (etiqueta y fecha de entrega).

---

## 6. Detalle de Unidad (Bloque) y Recursos

Ruta: `/platform/proyectos/[id]/unidades/[unidadId]`

Esta pantalla es el **hub de recursos** para un bloque específico:

- **Información de cabecera**
  - Proyecto, etiqueta de la unidad, fecha de entrega estimada.

- **Fases y tareas para la unidad**
  - Se listan las fases del proyecto con sus tareas.
  - Cada tarea incorpora:
    - Estado de completado (para esa unidad).
    - Recursos asociados:
      - Materiales asignados
      - Planillas (registros y bloques)
      - Servicios (Costos varios).

Aquí se conectan los 3 módulos principales de recursos:

1. **Materiales**  
2. **Planilla (mano de obra / planillas)**  
3. **Costos varios (Servicios)**  

Desde la UI se pueden abrir modales / formularios para asignar o quitar estos recursos a nivel de **tarea de unidad**.

---

## 7. Materiales

### 7.1 Catálogo e inventario

Ruta de UI: `/platform/materiales`  
API principal: `/api/materiales`, `/api/materiales/[id]`, `/api/proyectos/[id]/lotes`

- **CatalogoMaterial**
  - Define el material genérico:
    - `nombre`, `unidad`, categoría, costo unitario, stock total, color opcional.
  - Gestionado desde el módulo de **Materiales**.

- **Lotes de material (`LoteMaterial`)**
  - Reflejan compras concretas de un material para un proyecto:
    - `cantidad` disponible
    - `costoUnitario` del lote
    - Relación con `CatalogoMaterial` y `Proyecto`.

- **Inventario**
  - El stock total del material se calcula con base en los lotes y movimientos de inventario (`InventarioMovimiento`).
  - Hay endpoints para:
    - Ver movimientos
    - Proyección de consumo por proyecto.

### 7.2 Asignación de materiales a tareas (por unidad)

- Modelo: `MaterialAsignadoTarea`
  - Puede originarse desde:
    - Un `CatalogoMaterial` (stock general)
    - Un `LoteMaterial` concreto (lote de compra).
  - Campos:
    - `tareaId`, `unidadId`
    - `cantidad`
    - `monto` (cantidad × costo unitario del material/lote).

- Comportamiento:
  - Al asignar material a una tarea/unidad:
    - Se valida disponibilidad (stock o lote).
    - Se descuenta del lote / stock.
  - Al editar/quitar:
    - Se recalcula stock y monto.

---

## 8. Planilla (Bloques de mano de obra)

Ruta de UI: `/platform/planilla`  
Modelos clave: `Planilla`, `PlanillaRegistro`, `PlanillaRegistroAsignadoTarea`, `PlanillaAsignadaTarea`.

### 8.1 Estructura

- **Planilla**
  - Representa un **bloque de planilla** asociado a un proyecto:
    - Ejemplo: “Soldadores Mayo 1”, “Albañiles Semana 2”.
  - Pertenece a un proyecto (`proyectoId`).

- **PlanillaRegistro**
  - Son las **líneas internas** de la planilla (similar a ítems de nómina):
    - `nombre` (ej. “Oficial”, “Ayudante”, “Maestro de obra”)
    - `unidad` (`DIA`, `M2`, `M3`)
    - `tarifa` (costo unitario).

### 8.2 Asignación a tareas y unidades

- **PlanillaRegistroAsignadoTarea**
  - Asignaciones **por registro individual** a una tarea/unidad:
    - `planillaRegistroId`
    - `tareaId`
    - `unidadId`
    - `cantidad` (en la unidad indicada: días, m² o m³)
    - `monto` = `cantidad × tarifa`.

- **PlanillaAsignadaTarea** (bloques por unidad)
  - Asignación por **bloque** (nivel planilla, no por registro):
    - Se usa cuando quieres decir: “al bloque Casa 1 se le facturan 25 m² de la planilla Soldadores Mayo 1”.
  - Monto:
    - Se toma la **suma de tarifas** de todos los registros de la planilla que coinciden con la unidad de medida seleccionada (m²/m³/día).
    - `monto` = (suma tarifas en esa unidad) × `cantidad`.

### 8.3 Flujo en la UI

- En la pantalla de **Planilla**:
  - Se selecciona el proyecto.
  - Se crean **planillas** (bloques) y dentro de cada una:
    - Registros con `nombre`, `unidad`, `tarifa`.

- En el detalle de **unidad/tarea**:
  - Al asignar planilla:
    - Se elige **bloque de planilla**.
    - Se elige **unidad** permitida según la tarea:
      - Si la tarea tiene solo m² → solo se permite unidad `M2`.
      - Si la tarea tiene m³ o días, se valida contra esos campos.
    - Se ingresa la **cantidad** (limitada por la cantidad máxima de la tarea).
  - El backend valida:
    - Unidad compatible
    - Cantidad dentro del rango permitido.

---

## 9. Costos varios (Servicios)

Ruta de UI: `/platform/servicios` y asignaciones desde detalle de unidad/tarea.  
Modelo principal: `CatalogoServicio`, `ServicioAsignadoTarea`.

- **Catálogo de servicios**
  - Define servicios como:
    - “Renta de andamios”, “Transporte de escombros”, etc.
  - Campos:
    - `nombre`
    - `unidad` (ej. día, viaje, m³)
    - `costoUnitario`
    - `activo`.

- **Asignación a tareas**
  - Modelo `ServicioAsignadoTarea`:
    - `tareaId`, `unidadId`
    - `servicioId`
    - `cantidad`
    - `monto` = `cantidad × costoUnitario`.
  - Desde el detalle de unidad/tarea:
    - Se pueden agregar servicios, editar cantidad y quitar asignaciones.

---

## 10. Recursos disponibles y resumen económico

API: `/api/proyectos/[id]/recursos-disponibles`

- Devuelve:
  - **Lotes de materiales** con stock > 0 (nombre, unidad, stock, costo).
  - **Planillas** con sus registros (nombre, unidad, tarifa) y total calculado.
  - **Servicios** activos del catálogo.

Se utiliza para poblar los selectores en:

- Asignación de materiales a tareas.
- Asignación de bloques de planilla.
- Asignación de servicios (Costos varios).

---

## 11. Autenticación y temas (light/dark)

- Autenticación con **NextAuth** (`/api/auth/[...nextauth]`).
- Layout principal:
  - `PlatformShell` (sidebar + topbar + contenido).
  - `PlatformTopbar` incluye:
    - Nombre del usuario
    - Botón de cambio de tema.
- Tema:
  - Se controla con `data-theme="light" | "dark"` en `<html>`.
  - `globals.css` define variables CSS para ambos temas.
  - El logo en el sidebar (`.platform-sidebar-logo`) se invierte en **light** para que quede en negro sobre fondo blanco.

---

## 12. Rutas principales

- Autenticación:
  - `/auth/login`
- Plataforma:
  - `/platform` → redirección a proyectos.
  - `/platform/proyectos`
  - `/platform/proyectos/[id]`
  - `/platform/proyectos/[id]/unidades/[unidadId]`
  - `/platform/visor` (Control de Obra)
  - `/platform/materiales`
  - `/platform/planilla`
  - `/platform/servicios`
  - `/platform/equipo`
  - `/platform/perfil`

Esta documentación debería darte una visión completa del funcionamiento de la plataforma, de cómo interactúan **bloques/unidades**, **materiales**, **planillas** y **costos varios**, y de las rutas/API más importantes para seguir desarrollando obraOS.
