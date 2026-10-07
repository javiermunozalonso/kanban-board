## 1. Reproducir y fijar el comportamiento esperado

- [ ] 1.1 Reproducir el síntoma con un tablero que exceda el ancho de la ventana y documentar en una prueba de interacción qué ocurre al arrastrar en el centro y junto a cada borde; distinguir desplazamiento real de mera aparición de la barra.
- [ ] 1.2 Añadir cobertura de regresión para que el movimiento en la zona central no inicie auto-scroll horizontal y que el arrastre siga detectando y resaltando la columna destino.

## 2. Ajustar el disparador de desplazamiento

- [ ] 2.1 Limitar el auto-scroll horizontal a la zona de borde determinada en el diseño, conservando el seguimiento del puntero; verificar con pruebas que el centro no desplaza y los bordes sí permiten alcanzar columnas fuera de vista.
- [ ] 2.2 Mantener el desplazamiento manual y el reordenamiento/movimiento entre columnas; verificar que una tarjeta puede moverse a otra columna y reordenarse dentro de su columna sin regresiones.

## 3. Verificación integral

- [ ] 3.1 Ejecutar las pruebas del frontend y `npm run build`; confirmar que ambas verificaciones terminan correctamente.
- [ ] 3.2 Verificar en navegador el arrastre en el centro, ambos bordes, listas con desplazamiento vertical y tablero ancho; confirmar que la tarjeta sigue el puntero, el destino se resalta y el scroll manual sigue disponible.
