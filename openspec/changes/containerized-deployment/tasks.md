## 1. Imágenes de contenedor

- [x] 1.1 Crear `backend/Dockerfile` multistage para FastAPI; verificar que la imagen se construye y que `/api/health` responde correctamente al iniciar el contenedor.
- [x] 1.2 Crear `frontend/Dockerfile` multistage para compilar React/Vite y servir el artefacto de producción; verificar build y acceso HTTP a la aplicación desde navegador.
- [x] 1.3 Crear `mcp-tool/Dockerfile` multistage que ejecute el servidor MCP por stdio; verificar que la imagen inicia con stdin/stdout conectados y completa un handshake MCP.
- [x] 1.4 Configurar parámetros de ejecución para URL pública de API del frontend y URL interna de API para MCP; verificar que cada cliente resuelve su destino correcto sin usar `localhost` desde el contenedor MCP.

## 2. Topologías Compose y persistencia

- [x] 2.1 Crear `docker-compose.yml` en la raíz con backend API y frontend como topología base; verificar arranque conjunto y conectividad navegador→API.
- [x] 2.2 Añadir el componente MCP como opción invocable por el cliente agente, conservando stdio y sin publicar un puerto MCP; verificar ejecución con `docker compose run --rm -i` mientras la API está activa.
- [x] 2.3 Configurar montaje persistente para `backend/kanban.db` y permisos/ruta de trabajo coherentes; verificar creando datos, recreando el contenedor API y consultando que los datos sobreviven.
- [x] 2.4 Añadir `.dockerignore` apropiados para excluir entornos virtuales, dependencias locales, artefactos de build, cachés, base de datos local y secretos; verificar contexto de build y ausencia de datos locales en las imágenes.

## 3. Documentación y verificación integral

- [x] 3.1 Actualizar `README.md` con requisitos Docker, build/arranque/parada de modo base, ejecución MCP stdio desde el cliente y configuración de URLs y volumen; verificar comandos y nombres contra Compose.
- [x] 3.2 Ejecutar builds de las tres imágenes y validar configuración Compose; verificar los dos modos solicitados y que el modo base funciona sin iniciar MCP.
- [x] 3.3 Ejecutar prueba integral REST y sesión MCP real por stdio contra el backend contenerizado; verificar que ambas interfaces modifican/consultan el mismo estado persistido.
