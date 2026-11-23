# 1. Sitio estático con pedidos por WhatsApp

Fecha: 2026-10-22 · Estado: aceptada

## Contexto
Kairos Foods recibe pedidos de gente que come cerca, casi siempre desde el celular. No hay presupuesto para mantener un servidor ni una plataforma de pedidos con comisión.

## Decisión
Un sitio estático (Vite + React + TypeScript) sin backend. El cliente arma el pedido en el sitio y se abre WhatsApp con el mensaje ya escrito (`https://api.whatsapp.com/send?phone=<número>&text=...`; hasta el 2026-11-07 era `wa.me`, ver defecto D-01 en `docs/proyecto-final/04-pruebas.md`). El carrito se guarda en el celular (`localStorage`). Sin pagos en línea ni cuentas de usuario.

## Consecuencias
- Costo de hosting cero y nada que mantener en un servidor.
- El restaurante confirma cada pedido a mano por WhatsApp. No hay registro central de pedidos.
- Toda la lógica de precios es código puro con pruebas (`src/features/*`).
- El número va solo con dígitos y el código de país, y el texto con `encodeURIComponent`, como pide la guía "click to chat" de WhatsApp (https://faq.whatsapp.com/5913398998672934). El mensaje va siempre en español (ADR 0007) y, en express, puede traer los enlaces de la ubicación (ADR 0008).
