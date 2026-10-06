## Purpose

Esta capacidad define el empaquetado y la operación del producto Kanban en contenedores, con una topología web y otra que añade la interfaz MCP por stdio.

## ADDED Requirements

### Requirement: Ofrecer dos topologías de despliegue
El despliegue SHALL permitir iniciar la aplicación web con frontend y backend API, y SHALL permitir añadir opcionalmente la interfaz MCP como tercer componente ejecutable.

#### Scenario: Iniciar topología web
- **WHEN** el operador inicia el despliegue base
- **THEN** quedan disponibles el frontend y el backend API sin iniciar el proceso MCP

#### Scenario: Iniciar topología con MCP
- **WHEN** el operador selecciona el modo ampliado y un cliente agente ejecuta el componente MCP
- **THEN** frontend, backend API y el proceso MCP pueden operar simultáneamente
- **AND** el proceso MCP puede invocarse por el cliente manteniendo stdin y stdout conectados

### Requirement: Mantener MCP sobre stdio
La interfaz MCP SHALL conservar el transporte stdio y SHALL delegar las operaciones funcionales en la API REST del backend usando una dirección configurable adecuada a la red del despliegue.

#### Scenario: Cliente agente inicia MCP
- **WHEN** un cliente agente lanza el componente MCP en el modo ampliado
- **THEN** el protocolo MCP se comunica exclusivamente por stdin y stdout del proceso
- **AND** MCP accede a la API REST del backend mediante la dirección configurada

#### Scenario: MCP no está habilitado
- **WHEN** se usa únicamente la topología web
- **THEN** no se requiere que el proceso MCP esté ejecutándose para que frontend y API funcionen

### Requirement: Configurar conectividad entre componentes
El despliegue SHALL permitir que el navegador alcance la API publicada para el frontend y que el contenedor MCP alcance la API por la red interna del despliegue, sin depender de `localhost` dentro del contenedor MCP.

#### Scenario: Acceso de navegador
- **WHEN** el usuario opera el frontend desde su navegador
- **THEN** las peticiones REST se dirigen a la dirección de API configurada para el navegador

#### Scenario: Acceso MCP a API
- **WHEN** MCP realiza una operación con el backend activo
- **THEN** la petición llega al servicio API correcto usando su dirección de red interna configurable

### Requirement: Conservar la base de datos entre reinicios
El despliegue SHALL mantener los datos SQLite del backend en almacenamiento persistente fuera del ciclo de vida del contenedor API.

#### Scenario: Reiniciar backend
- **WHEN** se recrea o reinicia el contenedor del backend API
- **THEN** los tableros, columnas, tarjetas e historial previamente persistidos continúan disponibles

### Requirement: Construir imágenes desplegables
El repositorio SHALL proporcionar imágenes construibles para frontend, backend API y adaptador MCP, con instrucciones para construirlas y ejecutar cada topología.

#### Scenario: Construir imágenes
- **WHEN** el operador sigue las instrucciones de despliegue
- **THEN** puede construir las imágenes de frontend, backend API y MCP desde los directorios de proyecto correspondientes
