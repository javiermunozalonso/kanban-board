# Application Foundation Specification

## Purpose

Documenta el contrato técnico transversal que conecta la aplicación web, la API y la persistencia para soportar las funcionalidades Kanban.

## Requirements

### Requirement: Proporcionar API HTTP para las capacidades del producto
El backend SHALL exponer una API REST bajo `/api` para tableros, columnas, tarjetas y dashboards, junto con un endpoint de salud `/api/health`.

#### Scenario: Comprobar salud
- **WHEN** se solicita `GET /api/health`
- **THEN** la API devuelve el estado `ok`

#### Scenario: Consumir desde frontend y MCP
- **WHEN** la aplicación web o el servidor MCP ejecuta una operación del producto
- **THEN** utiliza la API HTTP como frontera de acceso a las operaciones backend

### Requirement: Persistir entidades relacionadas
El backend SHALL persistir tableros, columnas, tarjetas y eventos de auditoría en SQLite mediante SQLAlchemy asíncrono, manteniendo las relaciones tablero-columna-tarjeta-auditoría y sus eliminaciones en cascada.

#### Scenario: Inicializar la aplicación
- **WHEN** se inicia la aplicación backend
- **THEN** inicializa las tablas de base de datos definidas por los modelos

#### Scenario: Confirmar o revertir transacción
- **WHEN** una operación de base de datos termina correctamente
- **THEN** la sesión confirma la transacción
- **WHEN** ocurre una excepción durante la operación
- **THEN** la sesión revierte la transacción y propaga la excepción

### Requirement: Servir la interfaz y la API en desarrollo local
El repositorio SHALL mantener proyectos independientes para frontend, backend y servidor MCP, cada uno con sus dependencias y comandos de desarrollo documentados.

#### Scenario: Iniciar componentes
- **WHEN** se siguen los comandos de desarrollo documentados o el script unificado de tmux
- **THEN** se pueden iniciar backend, frontend y servidor MCP como componentes separados
