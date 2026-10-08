## 1. Backend: Observaciones y edición avanzada

- [x] 1.1 Añadir el modelo de observación vinculado a tarjeta, fechas, relación y borrado en cascada; verificar su creación en la base de pruebas y actualizar los tests de modelo si existen.
- [x] 1.2 Añadir endpoints CRUD de observaciones con validación de existencia y orden temporal; verificar que no generan eventos de auditoría.
- [x] 1.3 Ampliar la actualización de tarjetas para permitir todos los campos funcionales excepto ID y fechas, registrando cambios en auditoría.

## 2. Frontend: detalle, observaciones y auditoría

- [x] 2.1 Añadir métodos de API y UI para consultar, crear, editar y eliminar observaciones en un modal independiente.
- [x] 2.2 Añadir edición avanzada en el detalle de tarjeta, excluyendo ID y timestamps controlados por sistema.
- [x] 2.3 Añadir un modal independiente para consultar el historial detallado de auditoría.
- [x] 2.4 Cubrir componentes y flujos con pruebas unitarias/integración del frontend.

## 3. E2E con Playwright

- [x] 3.1 Incorporar Playwright y configurar la ejecución de pruebas de navegador según la estructura del proyecto.
- [x] 3.2 Añadir casos E2E para observaciones, edición avanzada y consulta de auditoría.
- [x] 3.3 Ejecutar validaciones completas y documentar los comandos/resultados.
