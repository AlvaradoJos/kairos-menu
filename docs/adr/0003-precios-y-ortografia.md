# 3. Precios con punto de miles, ortografía del menú impreso y mensaje sin emojis

Fecha: 2026-10-22 · Estado: aceptada

## Contexto
El plan mostraba `₡3800` y corregía la ortografía del menú impreso (Chesse, mozarella). `CLAUDE.md` pide `₡3.800` y dice que lo pendiente con el negocio no se muestre como definitivo. La ortografía está en la lista de dudas abiertas.

## Decisión
`formatColones` muestra `₡3.800`. Nombres y descripciones salen tal cual de `menu.json`, sin corregir, hasta que el negocio decida.

El mensaje de WhatsApp va sin emojis, aunque el ejemplo del spec traía 🍔 y ⚠️. Al abrir el enlace de wa.me, la página de WhatsApp los mostraba como "�" y Jose decidió quitarlos (2026-10-22). Los avisos ("Costo de envío por confirmar") quedan como líneas de texto al final del mensaje.

## Consecuencias
- Si el negocio aprueba corregir la ortografía, se cambia en `menu.json` y en los textos esperados de algunas pruebas (`Bacon & Chesse`).
- Una prueba falla si el mensaje vuelve a tener emojis. Para reponerlos, probar antes en un celular real y quitar esa prueba.
