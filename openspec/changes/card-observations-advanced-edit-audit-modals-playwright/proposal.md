## Why

Las tarjetas solo disponen de auditoría automática de cambios, que no permite registrar comentarios de seguimiento editables por las personas. Además, el detalle no ofrece una edición avanzada de los campos funcionales ni presenta la auditoría en una vista detallada independiente; faltan pruebas de navegador que validen estos recorridos como casos de uso.

## What Changes

- Incorporar observaciones independientes de la auditoría, con seguimiento temporal y operaciones para crear, consultar, editar y eliminar observaciones.
- Añadir en el detalle de la tarjeta acciones independientes para abrir el listado de observaciones y el modal de auditoría detallada.
- Añadir un modo de edición avanzada para modificar los campos de la tarjeta excepto su ID. Las fechas de creación y actualización seguirán gestionadas por el sistema.
- Incorporar Playwright y pruebas de navegador que validen los flujos principales como casos de uso.

## Capabilities

### New Capabilities

<!-- No se crea una capacidad nueva: las observaciones y la edición extienden la gestión existente de tarjetas. -->

### Modified Capabilities

- `card-management`: añadir persistencia y operaciones CRUD para observaciones, y permitir la edición avanzada de los campos funcionales de una tarjeta, manteniendo fuera el ID y las fechas gestionadas por el sistema.
- `web-interface`: incorporar las acciones y modales independientes para observaciones y auditoría, el modo de edición avanzada y los recorridos de usuario asociados.

## Impact

- Backend: modelo/persistencia, esquemas y API de tarjetas y observaciones; conservar la auditoría automática separada.
- Frontend: detalle de tarjeta, formularios/modales y servicios API.
- Pruebas: añadir Playwright al frontend y configurar casos de uso de navegador; coexistirá con Vitest y Testing Library para las pruebas existentes.
