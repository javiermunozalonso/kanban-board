## MODIFIED Requirements

### Requirement: Operar tarjetas en el detalle de tablero
La vista de detalle SHALL mostrar las columnas y tarjetas del tablero, permitir crear y eliminar tarjetas, abrir su detalle editable y soportar arrastrar tarjetas entre posiciones y columnas. El detalle de una tarjeta SHALL ofrecer acciones independientes para consultar observaciones, consultar la auditoría y abrir la edición avanzada.

#### Scenario: Mostrar y plegar columna
- **WHEN** el usuario activa el encabezado de una columna
- **THEN** la interfaz alterna entre la vista expandida y contraída mostrando el recuento de tarjetas

#### Scenario: Arrastrar tarjeta
- **WHEN** el usuario suelta una tarjeta sobre otra tarjeta o columna
- **THEN** la interfaz solicita al backend el movimiento a la columna y posición de destino y vuelve a cargar el tablero

#### Scenario: Ver detalle de tarjeta
- **WHEN** el usuario selecciona una tarjeta
- **THEN** se abre el modal de detalle con sus datos y acciones para editar y consultar por separado sus observaciones y auditoría

#### Scenario: Consultar observaciones
- **WHEN** el usuario activa la acción de observaciones desde el detalle de una tarjeta
- **THEN** se abre un modal específico que muestra las observaciones de esa tarjeta ordenadas de la más reciente a la más antigua

#### Scenario: Crear, editar y eliminar observación
- **WHEN** el usuario crea, edita o elimina una observación desde su modal
- **THEN** la interfaz persiste la operación y actualiza el listado de observaciones sin alterar la auditoría

#### Scenario: Consultar auditoría detallada
- **WHEN** el usuario activa la acción de auditoría desde el detalle de una tarjeta
- **THEN** se abre un modal independiente con los eventos de auditoría y el detalle disponible de cada cambio, incluidos campo, valores anterior y nuevo y fecha

#### Scenario: Editar campos avanzados de tarjeta
- **WHEN** el usuario activa la edición avanzada desde el detalle de una tarjeta
- **THEN** puede modificar todos los campos funcionales excepto el ID, mientras las fechas de creación y actualización no son editables, y al guardar se reflejan los cambios persistidos en la tarjeta y su auditoría

## ADDED Requirements

### Requirement: Validar recorridos de usuario en navegador
El proyecto SHALL disponer de pruebas de navegador que validen como casos de uso los recorridos principales de observaciones, edición avanzada y consulta de auditoría.

#### Scenario: Verificar gestión de observaciones como caso de uso
- **WHEN** se ejecuta el caso de uso de crear, consultar, editar y eliminar observaciones de una tarjeta
- **THEN** la prueba comprueba en navegador que las operaciones se reflejan en el listado y no se confunden con la auditoría

#### Scenario: Verificar edición avanzada y consulta de auditoría como casos de uso
- **WHEN** se ejecuta el caso de uso de edición avanzada seguido de la consulta de auditoría
- **THEN** la prueba comprueba en navegador que los campos permitidos se actualizan, el ID y las fechas gestionadas por el sistema no se editan y el modal de auditoría muestra el cambio registrado
