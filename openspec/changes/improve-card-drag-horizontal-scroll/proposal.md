## Why

Al arrastrar tarjetas en el tablero, el desplazamiento horizontal aparece o se activa de forma inesperada y dificulta llevar la tarjeta hasta su destino. En la zona central el destino sí se resalta y el arrastre parece funcionar; conviene hacer predecible el disparador del desplazamiento sin perder la navegación horizontal del tablero.

## What Changes

- Ajustar el desplazamiento horizontal automático durante el arrastre para que no interfiera con el movimiento normal de una tarjeta y se active de forma intencional cerca de los bordes del tablero.
- Conservar el desplazamiento horizontal manual, el resaltado de la columna destino y el movimiento/reordenamiento de tarjetas.
- Verificar el comportamiento en el centro y en ambos extremos del tablero, incluyendo tableros que exceden el ancho de la ventana.

## Capabilities

### New Capabilities

### Modified Capabilities
- `web-interface`: hacer predecible el desplazamiento horizontal del tablero durante el arrastre de tarjetas, sin impedir su movimiento entre columnas.

## Impact

- Interfaz: `frontend/src/pages/BoardDetailPage.jsx`, donde se configura `DndContext`, y estilos de `.kanban-board` en `frontend/src/styles/index.css`.
- Posibles pruebas de interacción de arrastre; el tablero usa `@dnd-kit/core` y actualmente no configura opciones explícitas de auto-scroll.
- No se esperan cambios en la API ni en el modelo de datos.
