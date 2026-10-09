## Context

Consulta `proposal.md` y los requisitos delta. La vista `BoardListPage` ya mantiene el filtro `All`/`Active`/`Dormant` y el arreglo de boards que se muestra. `GET /api/boards/{id}` devuelve el detalle del board con columnas y tareas. El dashboard general existente solo agrega boards activos, por lo que no representa el conjunto visible cuando el filtro es `Dormant` o `All`.

El frontend no tiene actualmente una dependencia para generar libros XLSX. La descarga de CSV y JSON puede generarse en el navegador; XLSX requerirá evaluar y añadir una biblioteca compatible con el proyecto.

## Goals / Non-Goals

**Goals:**
- Exportar todos los boards del listado visible, respetando su filtro vigente.
- Mantener una forma plana de tareas con referencias a board y columna de origen.
- Compartir una misma selección de datos para CSV, XLSX y JSON.
- Calcular totales combinados y desglose por board para los formatos que incluyen dashboard, sin excluir boards dormidos que estén en el conjunto exportado.

**Non-Goals:**
- Cambiar el comportamiento del dashboard general actual ni la vista global.
- Añadir selección individual de boards: la unidad de exportación es el resultado completo del filtro visible.
- Exportar historial de auditoría u observaciones de tareas, salvo que se decida como requisito separado.

## Decisions

- **Usar el conjunto ya cargado en la vista de Boards.** La exportación toma los boards que la interfaz muestra para el filtro actual; con `All` abarca ambos estados. Esto mantiene una sola fuente de verdad para el alcance y evita duplicar lógica de filtros.
- **Reutilizar los detalles de board existentes para la primera versión.** Obtener el detalle de cada board del listado mediante `GET /api/boards/{id}` proporciona sus columnas y tareas, incluidas para boards dormidos. Se derivan de esos datos tanto las filas planas como las agregaciones. La alternativa de crear un endpoint de exportación en backend evita múltiples solicitudes y centraliza la generación, pero añade API y generación de archivos del lado servidor sin una necesidad de escala demostrada; reconsiderarlo si el tamaño o número de boards produce latencia o consumo de memoria apreciables.
- **No reutilizar el dashboard general para calcular exportaciones.** Sus agregaciones solo incluyen boards activos. Calcular sobre los detalles del conjunto visible permite incluir los dormidos seleccionados y mantiene alineados los datos planos y agregados.
- **Usar un modelo plano común y serializarlo por formato.** Cada tarea exportada incluirá sus campos de tarea, identificador/título de columna e identificador/título/estado del board de origen. CSV serializa solo estas filas. XLSX las coloca en una hoja y coloca los totales del conjunto y el resumen por board en otra. JSON usa dos propiedades raíz, `tasks` y `aggregations`, con las mismas referencias de origen.
- **Mantener las definiciones existentes de agregación.** El total se obtiene de las tareas incluidas; distribución por columna se agrupa por título; `done` cuenta `DONE` y `ARCHIVE`, y `wip` cuenta `WORK IN PROGRESS`. Se calculará tanto el total combinado como cada desglose por board.
- **Generar los archivos en el navegador.** CSV y JSON pueden descargarse usando APIs del navegador. Para XLSX se añadirá una biblioteca de generación tras evaluar compatibilidad, tamaño y mantenimiento; no existe una dependencia XLSX en el manifiesto actual. Frente a generación en backend, esta opción reutiliza los datos cargados por la interfaz y no introduce un nuevo flujo de archivos/API, a costa de procesar los detalles en el cliente.

## Risks / Trade-offs

- [Muchos boards o tareas pueden causar múltiples solicitudes y consumo de memoria en el navegador] -> Cargar los detalles solo al iniciar la exportación, mostrar progreso/estado y evaluar un endpoint por lotes si el volumen observado lo justifica.
- [Títulos de columnas homónimos podrían mezclar distribuciones que conceptualmente sean distintas] -> Mantener el agrupamiento por título, que coincide con la semántica actual del dashboard global; conservar también la referencia de board y columna en cada tarea plana.
- [Los campos de texto pueden contener fórmulas interpretables por hojas de cálculo al abrir CSV] -> Neutralizar los prefijos de fórmula en campos de texto CSV y cubrirlos con pruebas, manteniendo los valores numéricos intactos.
- [Una biblioteca XLSX añade peso y mantenimiento al frontend] -> Elegir una dependencia estable y limitar su uso a la generación del archivo; validar el tamaño del bundle.
- [El listado puede cambiar de estado mientras la exportación está en curso] -> Usar los board IDs capturados al iniciar la acción; si un detalle ya no existe, comunicar el fallo y no presentar una exportación parcial como completa.
