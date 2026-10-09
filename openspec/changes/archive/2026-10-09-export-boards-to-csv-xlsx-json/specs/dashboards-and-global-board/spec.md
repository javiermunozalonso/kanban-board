## ADDED Requirements

### Requirement: Agregaciones de exportación para el conjunto de tableros
El sistema SHALL proporcionar en XLSX y JSON agregaciones calculadas sobre todos los tableros incluidos en la exportación, tanto activos como dormidos. Las agregaciones SHALL incluir totales del conjunto y un desglose por tablero, y conservar para cada desglose el identificador, nombre y estado del tablero. La distribución SHALL agrupar tareas por título de columna; `done` SHALL contar tareas en columnas `DONE` o `ARCHIVE`, y `wip` SHALL contar tareas en `WORK IN PROGRESS`.

#### Scenario: Agregar varios tableros seleccionados por el filtro
- **WHEN** se exportan varios tableros en XLSX o JSON
- **THEN** las agregaciones incluyen los totales combinados del conjunto y un resumen individual de cada tablero
- **AND** la distribución por columna combina las tareas de los tableros incluidos
- **AND** el desglose permite distinguir cada tablero por identificador, nombre y estado

#### Scenario: Agregar un único tablero
- **WHEN** la exportación incluye un solo tablero
- **THEN** las agregaciones incluyen los totales del tablero y su desglose individual

#### Scenario: Incluir tableros dormidos cuando corresponda
- **WHEN** el filtro de exportación incluye tableros dormidos
- **THEN** las tareas y agregaciones de esos tableros se incluyen igual que las de los activos
- **AND** no se incorporan tableros fuera del resultado visible del filtro

#### Scenario: Conservar la forma JSON diferenciada
- **WHEN** se genera una exportación JSON
- **THEN** el objeto raíz contiene una propiedad para los datos planos y otra para las agregaciones
- **AND** ambas propiedades mantienen la referencia al tablero de origen necesaria para filtrar por tablero
