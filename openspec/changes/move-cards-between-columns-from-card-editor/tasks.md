## 1. Selector y guardado del cambio de columna

- [x] 1.1 Añadir al formulario de edición de la card un desplegable de columnas del tablero actual, inicializado con la columna vigente; verificar con pruebas que lista y selección reflejan las columnas correctas.
- [x] 1.2 Guardar el cambio de columna con la operación existente, insertando al final de destino y conservando edición de título/descripción; verificar que los cambios se persisten, se actualiza la vista y la auditoría refleja el movimiento.

## 2. Regresión e integración

- [x] 2.1 Añadir o actualizar pruebas de interfaz para guardar solo la columna y guardar columna junto con título/descripción; verificar que guardar sin cambiar columna no solicita un movimiento y que un fallo parcial informa del error y refresca el estado persistido.
- [x] 2.2 Ejecutar las pruebas pertinentes del frontend y validar que el arrastre y reordenamiento existente siguen funcionando.
