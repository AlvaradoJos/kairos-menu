# 1. Sitio estático con pedidos por WhatsApp

Fecha: 2026-10-22 · Estado: aceptada

## Contexto
Kairos Foods recibe pedidos de gente que come cerca, casi siempre desde el celular. No hay presupuesto para mantener un servidor ni una plataforma de pedidos con comisión.

## Decisión
Un sitio estático (Vite + React + TypeScript) sin backend. El cliente arma el pedido en el sitio y se abre WhatsApp con el mensaje ya escrito (`https://wa.me/<número>?text=...`). El carrito se guarda en el celular (`localStorage`). Sin pagos en línea ni cuentas de usuario.

## Consecuencias
- Costo de hosting cero y nada que mantener en un servidor.
- El restaurante confirma cada pedido a mano por WhatsApp. No hay registro central de pedidos.
- Toda la lógica de precios es código puro con pruebas (`src/features/*`).
