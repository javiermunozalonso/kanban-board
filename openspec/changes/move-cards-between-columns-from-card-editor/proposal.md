## Why

La tarjeta ya puede cambiar de columna mediante arrastrar y soltar, pero la interfaz no ofrece una acción explícita para hacerlo desde la edición de la card. Esto dificulta cambiar su estado cuando se desea usar un control directo y accesible, y hace que la columna actual no forme parte de los campos editables.

## What Changes

- Añadir a la edición de una card un selector de columna disponible en el tablero actual.
- Al guardar un cambio de columna, mover la card a la columna elegida y actualizar la vista y su auditoría.
- Mantener el arrastre y reordenamiento existentes.

## Capabilities

### New Capabilities

### Modified Capabilities
- `web-interface`: permitir cambiar la columna de una card desde su edición, además de arrastrarla entre columnas y posiciones.

## Impact

- Interfaz: `frontend/src/components/CardDetailModal.jsx` y el flujo que actualiza tarjetas desde `frontend/src/pages/BoardDetailPage.jsx`.
- API existente: `PUT /api/cards/{card_id}/move`; no se propone un cambio de contrato backend. Al cambiar de columna desde el editor, la card se añadirá al final de la columna destino, siguiendo el comportamiento actual al soltarla sobre una columna.
- Pruebas de interfaz para selección, guardado, actualización visual y conservación del comportamiento de edición existente.
