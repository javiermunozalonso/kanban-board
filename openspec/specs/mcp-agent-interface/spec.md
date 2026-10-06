# MCP Agent Interface Specification

## Purpose

Define la interfaz MCP por stdio que permite a agentes operar la aplicación mediante las mismas capacidades expuestas por la API REST.

## Requirements

### Requirement: Exponer herramientas MCP de tableros
El servidor MCP SHALL exponer herramientas para listar, crear, consultar, actualizar y eliminar tableros, además de consultar su dashboard.

#### Scenario: Listar tableros con filtro opcional
- **WHEN** un cliente MCP invoca `list_boards` con un estado opcional
- **THEN** el servidor solicita el listado de la API con ese filtro y devuelve el resultado

#### Scenario: Crear y consultar tablero
- **WHEN** un cliente MCP invoca `create_board` o `get_board`
- **THEN** el servidor delega la operación a los endpoints REST correspondientes y devuelve su resultado

### Requirement: Exponer herramientas MCP de tarjetas
El servidor MCP SHALL exponer herramientas para crear, actualizar, mover y eliminar tarjetas, así como consultar su historial de auditoría.

#### Scenario: Operaciones de tarjeta
- **WHEN** un cliente MCP invoca una herramienta de tarjeta con sus argumentos requeridos
- **THEN** el servidor traduce los argumentos a la solicitud REST equivalente y devuelve la respuesta

### Requirement: Gestionar columnas mediante MCP
El servidor MCP SHALL proporcionar una herramienta `manage_columns` con acciones `add`, `update`, `delete` y `reorder`.

#### Scenario: Ejecutar acción de columna
- **WHEN** un cliente MCP invoca `manage_columns` con una acción y los argumentos asociados
- **THEN** el servidor delega en el endpoint REST de columnas correspondiente

### Requirement: Exponer dashboard general mediante MCP
El servidor MCP SHALL proporcionar una herramienta para consultar el dashboard general.

#### Scenario: Consultar dashboard general
- **WHEN** un cliente MCP invoca `get_general_dashboard`
- **THEN** el servidor consulta `/api/dashboard` y devuelve los datos recibidos

### Requirement: Comunicar errores de herramientas
El servidor MCP SHALL devolver los errores HTTP de la API como contenido textual que incluya el código HTTP y el detalle, y comunicar otros errores como texto.

#### Scenario: Error HTTP de backend
- **WHEN** una llamada delegada recibe una respuesta HTTP de error
- **THEN** el resultado textual incluye el código de estado y el cuerpo de error
