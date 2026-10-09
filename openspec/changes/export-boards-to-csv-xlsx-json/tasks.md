## 1. Modelo de exportación y agregaciones

- [x] 1.1 Crear la transformación de los detalles de boards a filas planas de tareas que incluyan identificador, nombre y estado del board, columna de origen y campos de tarea; verificar con pruebas unitarias un board vacío y varios boards con tareas.
- [x] 1.2 Calcular desde el mismo conjunto exportado las agregaciones combinadas y el desglose por board, agrupando por título de columna y aplicando las reglas `DONE`/`ARCHIVE` y `WORK IN PROGRESS`; verificar tareas en distintas columnas, board sin tareas y boards activos y dormidos.
- [x] 1.3 Definir y probar la serialización JSON con las propiedades raíz `tasks` y `aggregations`, incluyendo referencias de origen consistentes en ambas secciones.

## 2. Generación de archivos

- [x] 2.1 Implementar la generación CSV desde las filas planas, incluyendo encabezados y escapado correcto de valores con comas, comillas o saltos de línea; verificar mediante pruebas de contenido descargable.
- [x] 2.2 Seleccionar e incorporar una biblioteca XLSX compatible con el proyecto y generar un libro con hoja de tareas y hoja de dashboard; verificar nombres/estructura de hojas, filas y agregaciones mediante una prueba del archivo generado.
- [x] 2.3 Implementar la descarga JSON y comprobar que el archivo es JSON válido y conserva las dos propiedades y los datos de origen esperados.

## 3. Integración en la interfaz de Boards

- [x] 3.1 Añadir controles de exportación CSV, XLSX y JSON a la vista de Boards; verificar que la acción usa todos y solo los boards cargados para el filtro `All`, `Active` o `Dormant`.
- [x] 3.2 Cargar los detalles de los boards incluidos al iniciar la exportación y conectar cada formato con las transformaciones correspondientes; verificar una exportación con uno y con varios boards.
- [x] 3.3 Gestionar el estado de carga, el resultado vacío y los errores de obtención/generación sin ofrecer una descarga parcial como completa; verificar esos estados mediante pruebas de interfaz.

## 4. Verificación integrada

- [x] 4.1 Añadir o ampliar pruebas de interfaz que validen los tres formatos y el respeto del filtro, incluidas exportaciones con boards dormidos y `All`; ejecutar las pruebas frontend relevantes.
- [ ] 4.2 Ejecutar `npm test`, `npm run lint` y `npm run build` en `frontend`; confirmar que pasan y corregir cualquier regresión atribuible al cambio.
