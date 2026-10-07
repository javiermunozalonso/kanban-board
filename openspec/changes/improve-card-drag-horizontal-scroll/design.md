## Context

Véase `proposal.md` para la motivación y `specs/web-interface/spec.md` para el comportamiento esperado. `BoardDetailPage.jsx` usa `DndContext` de `@dnd-kit/core` con `closestCorners` y un `PointerSensor` cuya activación requiere 8 px de movimiento. El contenedor `.kanban-board` tiene `overflow-x: auto`; cada lista `.column-cards` desplaza verticalmente. No hay configuración explícita de auto-scroll en `DndContext`; no se ha confirmado todavía si el síntoma reportado se debe a auto-scroll, a la indicación visual del scroll o a la interacción entre contenedores anidados.

## Goals / Non-Goals

**Goals:**
- Restringir el inicio del desplazamiento horizontal automático a una zona de borde deliberada y permitir el movimiento normal y la detección de destinos en la zona central.
- Mantener disponibles el desplazamiento manual, el resaltado de destinos, el reordenamiento vertical y el movimiento entre columnas.
- Verificar el comportamiento con más columnas que las visibles y en ambos extremos del tablero.

**Non-Goals:**
- Eliminar el scroll horizontal manual ni rediseñar el ancho o la disposición de las columnas.
- Cambiar la API, persistencia o reglas de ordenamiento de tarjetas.
- Cambiar el flujo de movimiento de columna desde el editor.

## Decisions

- Mantener `@dnd-kit/core` y el `DndContext` existente; no añadir una dependencia para corregir una interacción local.
- Reproducir primero el efecto en el tablero real e identificar si es movimiento automático o solo aparición de la barra. Configurar el auto-scroll horizontal existente con una zona de activación de borde; si la versión instalada no permite limitar el comportamiento deseado sin afectar el eje vertical, usar un control local acotado al arrastre en vez de desactivar el scroll manual.
- Conservar `closestCorners`, el umbral de activación del sensor y los `useDroppable`/`useSortable` actuales salvo que la reproducción demuestre que alguno causa el fallo; no cambiar la semántica de selección del destino como parte de este ajuste.
- Elegir los límites de activación y la velocidad mediante pruebas de interacción en el navegador, comprobando que la tarjeta sigue el puntero y que puede volver a desplazarse en dirección contraria.

Alternativa considerada: desactivar por completo el auto-scroll de `DndContext`. Se descarta como comportamiento final porque impediría alcanzar columnas que quedan fuera de la ventana sin una alternativa equivalente; podría usarse solo si se añade un mecanismo local probado que preserve esa capacidad.

## Risks / Trade-offs

- [Un umbral demasiado amplio vuelve a iniciar el scroll mientras se apunta a una columna] → Validar que la zona central no activa el desplazamiento y limitar la zona de borde.
- [Un umbral demasiado estrecho dificulta alcanzar columnas fuera de vista] → Probar ambos bordes y ajustar la activación y velocidad con el arrastre real.
- [El scroll anidado vertical/horizontal puede interactuar con la detección de destinos] → Comprobar listas largas y tableros anchos, además del flujo básico de movimiento.
