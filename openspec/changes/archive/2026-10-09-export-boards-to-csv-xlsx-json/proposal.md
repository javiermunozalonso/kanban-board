## Why

La aplicación permite consultar tableros y agregaciones, pero no ofrece una forma de conservar, compartir o analizar sus datos fuera de la interfaz. La exportación permitirá reutilizar las tareas y sus resúmenes en herramientas de hojas de cálculo o procesamiento de datos, manteniendo identificable el tablero de origen.

## What Changes

- Añadir exportación de uno o varios tableros en CSV, XLSX y JSON.
- En la vista de Boards, determinar los tableros incluidos según el filtro activo: Active, Dormant o All.
- Exportar las tareas en formato plano, conservando la referencia al tablero de origen.
- En XLSX, incluir una hoja con tareas y otra con agregados del conjunto seleccionado y desglose por tablero.
- En JSON, incluir dos secciones diferenciadas: datos planos y agregaciones del conjunto seleccionado con desglose por tablero.
- Mantener identificadores, nombre y estado del tablero como dimensiones asociadas a los datos exportados.

## Capabilities

### New Capabilities

<!-- Ninguna: la exportación amplía capacidades existentes de interfaz y dashboards. -->

### Modified Capabilities

- `web-interface`: permitir iniciar exportaciones desde el listado de tableros y respetar el filtro de estado vigente.
- `dashboards-and-global-board`: definir las agregaciones exportadas para el conjunto elegido, con totales combinados, desglose por tablero y referencia de origen; admitir tableros activos y dormidos según la selección.

## Impact

- Interfaz web: listado de tableros y controles/formato de exportación.
- Datos de tableros, columnas y tarjetas expuestos por la API existente o por los ajustes necesarios para obtener la selección y sus agregados.
- Generación y descarga de archivos CSV, XLSX y JSON; se evaluará en diseño el uso de dependencias existentes o nuevas para XLSX.
