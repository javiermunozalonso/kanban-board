# Web Interface Specification

## Purpose

Define las vistas y las interacciones principales de la aplicación web React para operar tableros y consultar información agregada.

## Requirements

### Requirement: Navegar entre vistas
La aplicación SHALL ofrecer navegación a las vistas de tableros, tablero global y dashboard general, además del detalle individual de tablero.

#### Scenario: Abrir las vistas principales
- **WHEN** el usuario selecciona Boards, Global Board o Dashboard
- **THEN** la aplicación navega a la vista correspondiente

#### Scenario: Abrir detalle de tablero
- **WHEN** el usuario selecciona un tablero
- **THEN** la aplicación abre su detalle mediante una ruta asociada a su identificador

### Requirement: Gestionar tableros desde la interfaz
La vista de tableros SHALL mostrar el listado con filtros All, Active y Dormant y permitir crear, cambiar estado y eliminar tableros.

#### Scenario: Filtrar tableros
- **WHEN** el usuario selecciona All, Active o Dormant
- **THEN** la vista solicita y muestra el listado correspondiente

#### Scenario: Crear, cambiar estado o eliminar
- **WHEN** el usuario confirma una operación de creación, cambio de estado o eliminación
- **THEN** la interfaz invoca la API y actualiza el listado

### Requirement: Operar tarjetas en el detalle de tablero
La vista de detalle SHALL mostrar las columnas y tarjetas del tablero, permitir crear y eliminar tarjetas, abrir su detalle editable y soportar arrastrar tarjetas entre posiciones/columnas.

#### Scenario: Mostrar y plegar columna
- **WHEN** el usuario activa el encabezado de una columna
- **THEN** la interfaz alterna entre la vista expandida y contraída mostrando el recuento de tarjetas

#### Scenario: Arrastrar tarjeta
- **WHEN** el usuario suelta una tarjeta sobre otra tarjeta o columna
- **THEN** la interfaz solicita al backend el movimiento a la columna y posición de destino y vuelve a cargar el tablero

#### Scenario: Ver detalle de tarjeta
- **WHEN** el usuario selecciona una tarjeta
- **THEN** se abre el modal de detalle que permite consultar y editar datos e historial

### Requirement: Consultar vistas agregadas
La interfaz SHALL presentar el tablero global como vista de lectura agrupada por columna, con tarjetas identificadas por su tablero, y un dashboard general con indicadores y gráficos.

#### Scenario: Navegar desde tarjeta global
- **WHEN** el usuario selecciona una tarjeta de la vista global
- **THEN** la aplicación navega al detalle del tablero de origen

#### Scenario: Mostrar dashboard general
- **WHEN** se abre Dashboard
- **THEN** la interfaz presenta recuentos de tableros activos y dormidos, total de tarjetas, distribución por columnas y resumen gráfico por tablero
