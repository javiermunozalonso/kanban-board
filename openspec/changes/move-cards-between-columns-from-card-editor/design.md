## Context

La vista de detalle ya carga el tablero con sus columnas y tarjetas. El modal de tarjeta obtiene detalle e historial de auditoría, pero hoy solo edita título y descripción. La API ya expone `PUT /api/cards/{card_id}/move`, que acepta columna y posición, ajusta el orden y registra los cambios. Véase `proposal.md` y `specs/web-interface/spec.md`.

## Goals / Non-Goals

**Goals:**
- Hacer seleccionable la columna destino desde la edición de una tarjeta.
- Usar la operación de movimiento existente y mantener la auditoría y el orden coherente.
- Permitir guardar conjuntamente cambios de título/descripción y de columna.

**Non-Goals:**
- Cambiar el contrato o la implementación de la API.
- Añadir movimiento entre tableros, una selección explícita de posición desde el editor o retirar el arrastre.

## Decisions

- El formulario ofrecerá un desplegable con las columnas del tablero actual, con la columna vigente preseleccionada. La vista de detalle ya dispone de esa lista; se pasará al modal en lugar de añadir una consulta independiente.
- Al elegir otra columna y guardar, se llamará a `moveCard` con la posición final de la columna destino, equivalente a soltar una tarjeta directamente sobre una columna. Si la columna no cambia, no se ejecutará movimiento.
- Los cambios de título o descripción seguirán usando `updateCard`; el cambio de columna usará `moveCard`. Si el usuario modifica ambos tipos de datos, la interfaz ejecutará ambas operaciones y después refrescará tablero y detalle para mostrar el estado persistido y la auditoría. Las peticiones no son atómicas: si una falla, se informará del error y se volverán a consultar los datos para reflejar cualquier cambio que sí se haya guardado, sin indicar que la operación completa tuvo éxito.
- Se conserva el comportamiento de arrastrar y reordenar ya especificado y disponible.

Alternativa considerada: ampliar `PUT /api/cards/{id}` para aceptar `column_id`. Se descarta porque ya existe un endpoint específico que realiza el reordenamiento y la auditoría requeridos, evitando duplicar contratos de movimiento.

## Risks / Trade-offs

- [Una de dos peticiones falla cuando se guardan conjuntamente edición y movimiento] → Mostrar el error y volver a consultar el tablero y la tarjeta para reflejar el estado realmente persistido; no presentar el guardado como completo. Esta decisión evita ampliar el alcance con una operación atómica nueva en el backend.
- [El tablero cambia mientras el modal permanece abierto] → Antes de guardar, confirmar que la columna destino sigue disponible; manejar el error de la API y refrescar los datos.
