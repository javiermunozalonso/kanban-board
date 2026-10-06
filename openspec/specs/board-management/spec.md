# Board Management Specification

## Purpose

Define la gestión del ciclo de vida de los tableros Kanban, su estado y su estructura inicial.

## Requirements

### Requirement: Crear tableros con columnas predeterminadas
El sistema SHALL crear un tablero con título, descripción opcional, estado `active` y cinco columnas predeterminadas ordenadas: `BACKLOG`, `WORK IN PROGRESS`, `DONE`, `STOPPED` y `ARCHIVE`.

#### Scenario: Crear un tablero
- **WHEN** se crea un tablero con título y descripción opcional
- **THEN** el sistema devuelve el tablero con identificador, fechas, estado `active` y las cinco columnas predeterminadas sin tarjetas

### Requirement: Consultar y filtrar tableros
El sistema SHALL permitir listar tableros y obtener el detalle de un tablero con sus columnas y tarjetas ordenadas por posición.

#### Scenario: Listar todos los tableros
- **WHEN** se solicita el listado sin filtro
- **THEN** el sistema devuelve los tableros ordenados por fecha de creación descendente

#### Scenario: Filtrar por estado
- **WHEN** se solicita el listado con estado `active` o `dormant`
- **THEN** el sistema devuelve únicamente tableros cuyo estado coincide

#### Scenario: Consultar detalle inexistente
- **WHEN** se solicita un identificador de tablero que no existe
- **THEN** el sistema responde con HTTP 404

### Requirement: Actualizar el tablero
El sistema SHALL permitir actualizar título, descripción y estado (`active` o `dormant`) de un tablero existente.

#### Scenario: Actualizar campos
- **WHEN** se envían uno o varios campos editables para un tablero existente
- **THEN** el sistema actualiza esos campos y devuelve el tablero

#### Scenario: Actualizar tablero inexistente
- **WHEN** se actualiza un identificador que no existe
- **THEN** el sistema responde con HTTP 404

### Requirement: Eliminar tablero y contenido dependiente
El sistema SHALL permitir eliminar un tablero existente y sus columnas y tarjetas dependientes mediante borrado en cascada.

#### Scenario: Eliminar tablero existente
- **WHEN** se elimina un tablero
- **THEN** el sistema responde HTTP 204 y el tablero deja de estar disponible
