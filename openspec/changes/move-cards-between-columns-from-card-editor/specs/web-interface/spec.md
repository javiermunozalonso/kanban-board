## MODIFIED Requirements

### Requirement: Operar tarjetas en el detalle de tablero
La vista de detalle SHALL mostrar las columnas y tarjetas del tablero, permitir crear y eliminar tarjetas, abrir su detalle editable, cambiar la columna de una tarjeta desde su edición y soportar arrastrar tarjetas entre posiciones y columnas.

#### Scenario: Mostrar y plegar columna
- **WHEN** el usuario activa el encabezado de una columna
- **THEN** la interfaz alterna entre la vista expandida y contraída mostrando el recuento de tarjetas

#### Scenario: Arrastrar tarjeta
- **WHEN** el usuario suelta una tarjeta sobre otra tarjeta o columna
- **THEN** la interfaz solicita al backend el movimiento a la columna y posición de destino y vuelve a cargar el tablero

#### Scenario: Cambiar la columna desde la edición de tarjeta
- **WHEN** el usuario selecciona otra columna del mismo tablero en el formulario de edición y guarda
- **THEN** la interfaz mueve la tarjeta al final de la columna seleccionada, actualiza el tablero y muestra el cambio en el historial de auditoría

#### Scenario: Guardar cambios de tarjeta sin cambiar columna
- **WHEN** el usuario edita el título o la descripción sin cambiar la columna
- **THEN** la interfaz actualiza únicamente los campos editados y conserva el comportamiento de edición existente

#### Scenario: Fallo parcial al guardar edición y cambio de columna
- **WHEN** falla una de las operaciones al guardar conjuntamente cambios de título o descripción y un cambio de columna
- **THEN** la interfaz informa del error, vuelve a consultar los datos y muestra el estado realmente persistido sin indicar que el guardado completo tuvo éxito

#### Scenario: Ver detalle de tarjeta
- **WHEN** el usuario selecciona una tarjeta
- **THEN** se abre el modal de detalle que permite consultar y editar título, descripción y columna, además de consultar el historial
