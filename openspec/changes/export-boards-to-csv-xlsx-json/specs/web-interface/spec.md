## ADDED Requirements

### Requirement: Exportar tableros desde la vista de boards
La interfaz SHALL permitir exportar los tableros incluidos en el listado visible en formato CSV, XLSX o JSON. La exportación SHALL respetar el filtro de estado vigente: `Active` incluye los tableros activos, `Dormant` incluye los dormidos y `All` incluye ambos estados. Si el resultado contiene un solo tablero, la exportación incluirá ese tablero; si contiene varios, los incluirá todos.

#### Scenario: Exportar el resultado filtrado por estado
- **WHEN** el usuario solicita una exportación mientras está activo el filtro `Active` o `Dormant`
- **THEN** el archivo incluye todos y solo los tableros del listado que coinciden con ese filtro
- **AND** los datos planos de cada tarea conservan el identificador, nombre y estado de su tablero de origen

#### Scenario: Exportar todos los tableros
- **WHEN** el usuario solicita una exportación con el filtro `All`
- **THEN** el archivo incluye tableros activos y dormidos mostrados en el listado
- **AND** los datos planos de cada tarea conservan el identificador, nombre y estado de su tablero de origen

#### Scenario: Exportar en CSV
- **WHEN** el usuario selecciona CSV
- **THEN** el archivo descargado contiene las tareas de los tableros incluidos en el listado en formato plano, con los datos necesarios para identificar su tablero y columna de origen
- **AND** no contiene una hoja ni una sección de dashboard agregado

#### Scenario: Proteger texto de fórmulas en CSV
- **WHEN** un campo de texto exportado comienza con un carácter que una hoja de cálculo puede interpretar como fórmula
- **THEN** el CSV neutraliza esa interpretación manteniendo el contenido como texto

#### Scenario: Exportar en XLSX
- **WHEN** el usuario selecciona XLSX
- **THEN** el libro descargado contiene una hoja con las tareas en formato plano y otra hoja con las agregaciones del conjunto exportado y el desglose por tablero

#### Scenario: Exportar en JSON
- **WHEN** el usuario selecciona JSON
- **THEN** el archivo contiene un objeto principal con dos propiedades diferenciadas para los datos planos de tareas y las agregaciones del conjunto exportado con desglose por tablero
