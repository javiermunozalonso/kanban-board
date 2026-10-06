# Card Management Specification

## Purpose

Define la creación, consulta, edición, movimiento, orden y eliminación de tarjetas, así como el registro de auditoría asociado a sus cambios.

## Requirements

### Requirement: Crear tarjetas
El sistema SHALL permitir crear una tarjeta en una columna existente con título obligatorio y descripción opcional. La tarjeta se coloca al final de la columna y se registra un evento de auditoría de creación.

#### Scenario: Crear tarjeta en columna existente
- **WHEN** se crea una tarjeta con título y descripción opcional en una columna existente
- **THEN** la tarjeta recibe la siguiente posición disponible y se registra la columna asociada como evento `created`

#### Scenario: Crear tarjeta en columna inexistente
- **WHEN** se intenta crear una tarjeta en una columna inexistente
- **THEN** el sistema responde con HTTP 404

### Requirement: Consultar y actualizar tarjetas
El sistema SHALL permitir consultar una tarjeta con su historial de auditoría y modificar título o descripción de una tarjeta existente.

#### Scenario: Consultar tarjeta
- **WHEN** se consulta una tarjeta existente
- **THEN** la respuesta incluye sus datos y los eventos de auditoría ordenados del más reciente al más antiguo

#### Scenario: Actualizar título o descripción
- **WHEN** se modifica el título o la descripción de una tarjeta
- **THEN** el sistema registra el valor anterior y el nuevo valor en auditoría y devuelve la tarjeta actualizada

#### Scenario: Consultar o actualizar tarjeta inexistente
- **WHEN** se solicita o modifica una tarjeta inexistente
- **THEN** el sistema responde con HTTP 404

### Requirement: Mover y reordenar tarjetas
El sistema SHALL permitir mover una tarjeta a una posición de una columna destino o reordenarla dentro de su columna, desplazando las demás tarjetas afectadas para mantener el orden solicitado.

#### Scenario: Mover entre columnas
- **WHEN** una tarjeta se mueve a una columna distinta en una posición dada
- **THEN** el sistema cierra el hueco en la columna origen, abre espacio en la destino y actualiza la columna y posición de la tarjeta

#### Scenario: Reordenar dentro de la misma columna
- **WHEN** una tarjeta se mueve a otra posición de su misma columna
- **THEN** el sistema ajusta en una unidad las posiciones intermedias para conservar el orden sin huecos

#### Scenario: Movimiento sin cambio de posición
- **WHEN** la tarjeta ya ocupa la posición solicitada en su columna
- **THEN** el sistema devuelve la tarjeta sin alterar posiciones ni añadir un evento de cambio

#### Scenario: Registrar cambios de movimiento
- **WHEN** un movimiento cambia de columna o de posición
- **THEN** el historial registra los cambios de columna (si aplica) y posición

### Requirement: Eliminar tarjeta
El sistema SHALL permitir eliminar una tarjeta existente junto con su historial de auditoría.

#### Scenario: Eliminar tarjeta existente
- **WHEN** se elimina una tarjeta
- **THEN** el sistema responde HTTP 204 y elimina sus eventos de auditoría dependientes
