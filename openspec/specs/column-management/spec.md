# Column Management Specification

## Purpose

Define la administración de columnas pertenecientes a tableros: alta, edición, orden, estado contraído y eliminación.

## Requirements

### Requirement: Añadir columnas
El sistema SHALL permitir añadir una columna a un tablero existente con título y posición opcional. Si no se proporciona posición, se asigna una posición posterior a la posición máxima existente (o cero si no hay columnas).

#### Scenario: Añadir columna al final por defecto
- **WHEN** se añade una columna sin posición a un tablero existente
- **THEN** el sistema la crea en la siguiente posición disponible

#### Scenario: Añadir a tablero inexistente
- **WHEN** se intenta añadir una columna a un tablero inexistente
- **THEN** el sistema responde con HTTP 404

### Requirement: Actualizar propiedades de columna
El sistema SHALL permitir modificar el título, la posición y el estado `collapsed` de una columna existente.

#### Scenario: Actualizar propiedades
- **WHEN** se envía uno o varios campos editables para una columna existente
- **THEN** el sistema actualiza únicamente los campos proporcionados

#### Scenario: Actualizar columna inexistente
- **WHEN** se modifica una columna que no existe
- **THEN** el sistema responde con HTTP 404

### Requirement: Reordenar columnas
El sistema SHALL aceptar una lista ordenada de identificadores de columna y asignar a cada columna su índice como nueva posición.

#### Scenario: Reordenar identificadores válidos
- **WHEN** se envía una lista de identificadores de columnas existentes
- **THEN** el sistema asigna posiciones consecutivas desde cero en el orden recibido

#### Scenario: Incluir identificador inexistente
- **WHEN** la lista de reordenamiento contiene un identificador que no existe
- **THEN** el sistema responde con HTTP 404

### Requirement: Eliminar columna y tarjetas
El sistema SHALL permitir eliminar una columna existente y las tarjetas que dependen de ella.

#### Scenario: Eliminar columna existente
- **WHEN** se elimina una columna
- **THEN** el sistema responde HTTP 204 y elimina sus tarjetas dependientes
