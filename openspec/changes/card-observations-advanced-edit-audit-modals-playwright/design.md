## Context

Véase `proposal.md` para la motivación y `specs/card-management/spec.md` y `specs/web-interface/spec.md` para el contrato de comportamiento. Actualmente la tarjeta persiste título, descripción, columna, posición y fechas; su detalle consulta `audit_logs` y edita título, descripción y columna. El backend usa SQLAlchemy asíncrono con SQLite y crea las tablas declaradas al iniciar. El frontend ya usa Vitest y Testing Library, pero no declara Playwright en `package.json`.

## Goals / Non-Goals

**Goals:**
- Mantener observaciones y auditoría como registros distintos, con ciclos de vida y presentación separados.
- Permitir editar los campos funcionales de la tarjeta conservando las reglas de orden de columnas.
- Validar los recorridos mediante pruebas reales de navegador organizadas como casos de uso.

**Non-Goals:**
- Hacer editables el ID o las fechas `created_at` y `updated_at`.
- Permitir modificar o borrar eventos de auditoría mediante la gestión de observaciones.
- Reemplazar las pruebas unitarias y de componentes existentes.

## Decisions

- **Persistir observaciones como entidad propia asociada a la tarjeta.** La entidad tendrá contenido y fechas de creación/modificación, con eliminación en cascada al borrar la tarjeta. Se descarta reutilizar `CardAuditLog`: la auditoría es automática e inmutable desde el flujo de observaciones, mientras estas son contenido manual editable y eliminable.
- **Exponer operaciones de observaciones separadas de la actualización de tarjeta.** El detalle consultará su colección y las acciones CRUD por separado; las respuestas incluirán las fechas y el listado se ordenará por modificación más reciente. Los modales de observaciones y auditoría serán independientes.
- **Reutilizar las operaciones de actualización y movimiento existentes para la edición avanzada.** Título y descripción se actualizarán mediante la operación de tarjeta; columna y posición utilizarán la operación de movimiento para preservar compactación de posiciones y auditoría existente. Si cambia la columna sin especificar otra posición, se moverá al final de la columna destino, como en la edición actual. Las fechas seguirán siendo generadas por el backend.
- **Añadir Playwright como capa de pruebas de navegador.** Los tests cubrirán recorridos observables de extremo a extremo y coexistirán con Vitest/Testing Library; no se migrarán pruebas unitarias existentes. La configuración de los tests deberá usar un backend y datos de prueba aislados para no tocar la base de datos local de desarrollo.
- **Conservar timestamps en observaciones.** Crear establece ambas fechas; editar conserva `created_at` y actualiza `updated_at`. El listado se ordena por `updated_at` descendente para que la actividad reciente aparezca primero.

## Risks / Trade-offs

- [Actualización avanzada con varias operaciones] → El movimiento y los cambios de título/descripción usan operaciones existentes separadas y no son atómicos; ante un fallo parcial, la interfaz informará del error y recargará tarjeta, tablero y auditoría desde el estado persistido.
- [Pruebas E2E dependientes de servicios] → Arrancar frontend y backend con una base de datos aislada por ejecución y limpiar los datos creados por cada caso.
- [SQLite existente] → `create_all` crea la nueva tabla de observaciones en bases existentes sin modificar tablas previas; no requiere migración de columnas para este modelo nuevo.
