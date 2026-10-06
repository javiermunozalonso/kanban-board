## Context

Véase `proposal.md` para la motivación y el alcance. Actualmente frontend, API y MCP son proyectos separados. El backend inicia FastAPI en `backend/app/main.py`; SQLite usa `sqlite+aiosqlite:///./kanban.db`. El frontend fija la URL de API en `frontend/src/services/api.js`, y el adaptador MCP en `mcp-tool/kanban_mcp/server.py`; ambos apuntan hoy a `http://localhost:8000/api`. MCP inicia con stdio y delega sus operaciones a la REST API. El arranque de desarrollo existente está en `start_stack.sh`.

## Goals / Non-Goals

**Goals:**
- Mantener una única capacidad de backend con dos interfaces de entrada: REST para frontend y MCP para agentes.
- Entregar una topología base con frontend y API y una topología ampliada que permita ejecutar MCP bajo demanda por stdio.
- Mantener los proyectos fuente separados y construir una imagen para cada uno.
- Hacer explícita la configuración de URL del navegador y de la URL interna usada por MCP, además de la persistencia SQLite.

**Non-Goals:**
- Cambiar el protocolo MCP a HTTP/SSE/Streamable HTTP ni publicar un puerto MCP.
- Eliminar o sustituir la API REST, modificar el contrato funcional de las herramientas MCP o introducir una nueva capa de dominio como refactor independiente.
- Reemplazar SQLite por un servidor de base de datos.
- Cambiar el flujo local de desarrollo con tmux.

## Decisions

### Decisión A: conservar stdio y ejecutar MCP como proceso cliente-iniciado
El componente MCP continúa siendo un adaptador stdio separado, ubicado en el proyecto existente `mcp-tool/`, y llama a la API REST. En el modo ampliado, el cliente agente inicia el contenedor MCP con stdin/stdout conectados (por ejemplo, mediante `docker compose run --rm -i mcp`); no se modela como un daemon de red ni como proceso persistente iniciado por `compose up`.

**Alternativas consideradas:** cambiar a transporte MCP de red permitiría un servicio persistente, pero cambiaría el contrato de transporte y el modo de conexión de los clientes, que el usuario ha decidido conservar como stdio.

**Consecuencia:** el servicio MCP debe compartir la red Compose con la API y recibir una URL interna configurable, normalmente basada en el nombre del servicio API. El MCP no necesita exponer puertos al host.

### Decisión A: imágenes independientes y Compose en la raíz
Cada proyecto mantiene su propio Dockerfile multistage: `frontend/Dockerfile`, `backend/Dockerfile` y `mcp-tool/Dockerfile`. `docker-compose.yml` en la raíz define la topología base y el componente MCP opcional.

**Alternativas consideradas:** una sola imagen para toda la aplicación simplificaría el número de imágenes, pero mezclaría ciclos de vida y toolchains distintos y dificultaría omitir MCP en la topología base.

**Consecuencia:** la fuente y dependencias de cada tecnología permanecen aisladas; las operaciones conjuntas se coordinan desde Compose.

### Decisión A: separar URL para navegador y URL interna MCP
La URL consumida por el frontend debe configurarse para el navegador (donde `localhost` refiere al equipo del usuario), y la URL que usa MCP debe configurarse para la red interna (donde `localhost` refiere al propio contenedor). El frontend no debe recibir una URL Docker interna que el navegador no pueda resolver.

**Alternativas consideradas:** servir frontend y API bajo un único origen/proxy evitaría configurar una URL pública, pero introduce configuración de proxy/rutas que no existe hoy y no es necesaria para este despliegue inicial.

**Consecuencia:** documentar y suministrar ambas configuraciones explícitamente; no reutilizar una sola URL para ambos clientes.

### Decisión A: volumen persistente para SQLite
El archivo SQLite se mantiene fuera del ciclo de vida del contenedor y se monta en la ruta de trabajo que usa la configuración de base de datos del backend.

**Alternativas consideradas:** guardar la base dentro de la capa escribible del contenedor es más simple, pero pierde datos al recrear el contenedor.

**Consecuencia:** el operador debe conservar el volumen al actualizar/recrear servicios; eliminar el volumen equivale a eliminar los datos.

## Risks / Trade-offs

- [MCP stdio no es un endpoint de red] -> El cliente agente debe poder ejecutar el comando Docker/Compose y mantener stdin/stdout conectados; documentar la invocación exacta y la topología necesaria.
- [Dirección de API mal configurada para navegador o MCP] -> Proveer variables separadas, valores de ejemplo y una verificación de conectividad para ambas rutas.
- [Pérdida de SQLite por montar un volumen en una ruta distinta al archivo real] -> Alinear directorio de trabajo, ruta de base de datos y montaje, y verificar persistencia tras recrear el contenedor.
- [Diferencia entre perfiles/servicios opcionales y stdio interactivo] -> Mantener MCP como servicio invocable bajo demanda y verificar stdin/stdout con un cliente MCP de prueba.

## Migration Plan

1. Añadir los tres Dockerfiles multistage sin alterar los comandos de desarrollo actuales.
2. Añadir Compose en la raíz con API y frontend en la topología base, almacenamiento persistente y configuración de direcciones; añadir MCP como componente opcional invocable con stdio.
3. Documentar construcción, arranque de la topología base, invocación MCP con el backend activo, configuración del cliente agente, persistencia y parada.
4. Verificar build de cada imagen, arranque/health de frontend y API, una operación REST, inicialización y persistencia SQLite tras recreación, y una sesión MCP real por stdio que invoque una operación de API.
5. Revertir retirando la configuración de despliegue Docker; los proyectos y el arranque tmux previos permanecen disponibles.

## Open Questions

Ninguna. El transporte stdio y las dos topologías están decididos; los nombres y valores finales de variables de entorno se concretarán al implementar, manteniendo separadas URL de navegador e URL interna MCP.
