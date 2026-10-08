## MODIFIED Requirements

### Requirement: Consultar y actualizar tarjetas
El sistema SHALL permitir consultar una tarjeta con su historial de auditoría y modificar todos sus campos funcionales excepto su identificador. Las fechas de creación y actualización SHALL permanecer gestionadas por el sistema. Cada cambio funcional SHALL registrarse en auditoría y la respuesta SHALL devolver la tarjeta actualizada.

#### Scenario: Consultar tarjeta
- **WHEN** se consulta una tarjeta existente
- **THEN** la respuesta incluye sus datos y los eventos de auditoría ordenados del más reciente al más antiguo

#### Scenario: Actualizar campos funcionales
- **WHEN** se modifican uno o más campos funcionales de una tarjeta existente
- **THEN** el sistema persiste los cambios, registra en auditoría los valores anteriores y nuevos, conserva el identificador y mantiene las fechas gestionadas por el sistema

#### Scenario: Actualizar título o descripción
- **WHEN** se modifica el título o la descripción de una tarjeta
- **THEN** el sistema registra el valor anterior y el nuevo valor en auditoría y devuelve la tarjeta actualizada

#### Scenario: Actualizar columna o posición
- **WHEN** se modifica la columna o la posición de una tarjeta
- **THEN** el sistema actualiza el orden de las columnas afectadas sin dejar huecos ni posiciones duplicadas y registra los cambios en auditoría

#### Scenario: Consultar o actualizar tarjeta inexistente
- **WHEN** se solicita o modifica una tarjeta inexistente
- **THEN** el sistema responde con HTTP 404

## ADDED Requirements

### Requirement: Gestionar observaciones de tarjetas
El sistema SHALL permitir crear, consultar, editar y eliminar observaciones asociadas a una tarjeta, manteniéndolas separadas de los eventos automáticos de auditoría. Cada observación SHALL conservar su fecha de creación y actualizar su fecha de modificación al editarse. Las observaciones SHALL mostrarse de la más reciente a la más antigua.

#### Scenario: Crear observación
- **WHEN** se añade una observación a una tarjeta existente
- **THEN** el sistema la persiste como una entrada independiente con sus fechas de creación y modificación

#### Scenario: Consultar observaciones
- **WHEN** se consultan las observaciones de una tarjeta
- **THEN** el sistema devuelve únicamente sus observaciones, ordenadas de la más reciente a la más antigua, sin mezclarlas con la auditoría

#### Scenario: Editar observación
- **WHEN** se modifica una observación existente
- **THEN** el sistema persiste el nuevo contenido, conserva su fecha de creación y actualiza su fecha de modificación

#### Scenario: Eliminar observación
- **WHEN** se elimina una observación existente
- **THEN** el sistema elimina esa observación sin eliminar ni modificar los eventos de auditoría de la tarjeta

#### Scenario: Operar sobre tarjeta u observación inexistente
- **WHEN** se intenta consultar o modificar una observación inexistente, o gestionar observaciones de una tarjeta inexistente
- **THEN** el sistema responde con HTTP 404
