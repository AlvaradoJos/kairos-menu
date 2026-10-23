# 3. Precios con punto de miles y ortografía del menú impreso

Fecha: 2026-10-22 · Estado: aceptada

## Contexto
El plan mostraba `₡3800` y corregía la ortografía del menú impreso (Chesse, mozarella). `CLAUDE.md` pide `₡3.800` y dice que lo pendiente con el negocio no se muestre como definitivo. La ortografía está en la lista de dudas abiertas.

## Decisión
`formatColones` muestra `₡3.800`. Nombres y descripciones salen tal cual de `menu.json`, sin corregir, hasta que el negocio decida.

## Consecuencias
- Si el negocio aprueba corregir la ortografía, se cambia en `menu.json` y en los textos esperados de algunas pruebas (`Bacon & Chesse`).
