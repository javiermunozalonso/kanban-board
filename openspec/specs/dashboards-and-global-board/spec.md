# Dashboards and Global Board Specification

## Purpose

Define los indicadores agregados de tableros y la vista Kanban global de tarjetas de tableros activos.

## Requirements

### Requirement: Consultar dashboard de un tablero
El sistema SHALL devolver para un tablero el total de tarjetas, el recuento por título de columna, hasta diez eventos de auditoría recientes y los recuentos `created` y `completed`.

#### Scenario: Dashboard de tablero existente
- **WHEN** se consulta el dashboard de un tablero existente
- **THEN** la respuesta incluye `board_id`, `board_title`, `total_cards`, `cards_per_column`, `recent_activity` y `created_vs_completed`
- **AND** `completed` cuenta tarjetas en columnas tituladas `DONE` o `ARCHIVE`

#### Scenario: Dashboard de tablero inexistente
- **WHEN** se consulta el dashboard de un tablero que no existe
- **THEN** el sistema responde con HTTP 404

### Requirement: Consultar dashboard general
El sistema SHALL agregar estadísticas de todos los tableros, contabilizando las tarjetas y distribución global únicamente de tableros activos.

#### Scenario: Agregación general
- **WHEN** se consulta el dashboard general
- **THEN** la respuesta incluye número de tableros activos y dormidos, total de tarjetas activas, resumen por tablero activo y distribución por título de columna
- **AND** el resumen clasifica como `done` las tarjetas de `DONE` y `ARCHIVE` y como `wip` las de `WORK IN PROGRESS`

#### Scenario: Excluir tarjetas de tableros dormidos
- **WHEN** existen tarjetas en tableros con estado `dormant`
- **THEN** dichas tarjetas no se incluyen en el total, resumen ni distribución del dashboard general

### Requirement: Consultar tablero global
El sistema SHALL agrupar las tarjetas de todos los tableros activos por título de columna y conservar en cada tarjeta la referencia a su tablero de origen.

#### Scenario: Agrupar tarjetas activas
- **WHEN** se consulta el tablero global
- **THEN** la respuesta contiene columnas agrupadas por título y tarjetas con título, descripción, identificadores de tarjeta/tablero/columna, título del tablero, posición y fechas
- **AND** no se incluyen tarjetas de tableros dormidos
