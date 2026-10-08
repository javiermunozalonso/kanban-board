## 1. Persistencia y API

- [x] 1.1 Añadir el modelo de observación vinculado a tarjeta, fechas, relación y borrado en cascada; verificar su creación en la base de pruebas y actualizar los tests de modelo si existen.
- [ ] 1.2 Implementar esquemas y operaciones API para listar, crear, editar y eliminar observaciones, con orden temporal y respuestas 404; verificar con tests de API los casos exitosos, aislamiento respecto de auditoría y entidades inexistentes.
- [ ] 1.3 Ampliar la actualización avanzada de tarjeta para los campos funcionales, excluyendo ID y fechas; reutilizar movimiento para columna/posición y verificar auditoría, orden sin huecos y respuestas 404 en tests backend.

## 2. Interfaz de detalle de tarjeta

- [ ] 2.1 Añadir la acción y el modal independiente de observaciones con alta, edición, eliminación y recarga del listado; verificar cada operación mediante pruebas de componentes.
- [ ] 2.2 Añadir la acción y el modal independiente de auditoría con campo, valores anterior/nuevo y fecha; verificar que muestra el historial automático sin acciones de edición o eliminación.
- [ ] 2.3 Añadir el modo de edición avanzada para todos los campos funcionales salvo ID y fechas, incluyendo columna y posición; verificar guardado, cancelación, auditoría y recuperación ante fallo parcial con pruebas de componentes.

## 3. Pruebas de navegador con Playwright

- [ ] 3.1 Añadir Playwright, configuración y comandos para ejecutar pruebas de navegador contra frontend y backend con base de datos aislada; verificar instalación y arranque de la configuración.
- [ ] 3.2 Implementar un caso de uso E2E de creación, consulta, edición y eliminación de observaciones, y verificar que permanecen separadas de la auditoría.
- [ ] 3.3 Implementar un caso de uso E2E de edición avanzada y consulta del modal de auditoría, verificando que ID y fechas no son editables y que los cambios se reflejan en el historial.

## 4. Verificación integrada

- [ ] 4.1 Ejecutar y verificar los tests backend, Vitest, Playwright y build/lint del frontend; documentar cualquier limitación de entorno sin marcar como verificados los checks no ejecutados.
