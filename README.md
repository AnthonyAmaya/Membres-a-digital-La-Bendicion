# Iglesia La Bendición

Aplicación web para que el pastor y el equipo de **Iglesia La Bendición** acompañen a la comunidad: registrar nuevos creyentes, ver qué hace cada persona, marcar su trayectoria en la iglesia e imprimir su ficha.

Lema: **Amparando · Librando · Salvando**

Esta copia es una **demo**: arranca sin personas. Quedan los ministerios y el camino por defecto para que puedas registrar a quien llegue.

## Acceso

- Usuario: `pastor`
- Contraseña: `bendicion`

En Vercel, en **Settings → Environment Variables**, conviene definir `SESSION_SECRET` (cualquier texto largo y secreto). Si no, se usa una clave de demostración.

## Datos

- En local: SQLite en `data/la-bendicion.db` y fotos en `data/fotos`.
- En Vercel el disco no persiste: base y fotos viven en `/tmp` y pueden vaciarse entre visitas o redespliegues. Sirve para mostrar la demo; para una iglesia real hace falta un servidor con disco o una base externa (por ejemplo Turso).

En el inicio puedes **cargar ejemplos** (personas inventadas) o **vaciar** la comunidad.

## Qué puedes hacer

- Entrar con usuario y contraseña
- Ver un resumen de la comunidad en el inicio
- Registrar a un visitante o nuevo creyente, con foto
- Consultar ficha, contacto, ocupación y ministerios
- Marcar la trayectoria de cada persona
- Agregar, quitar o modificar los pasos del camino
- Agregar, quitar o modificar los ministerios
- Imprimir o guardar en PDF la ficha

## Cómo correrlo en local

Necesitas **Node.js 22** o superior.

```bash
npm install
npm run dev
```

Abre [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Repositorio

El código de producción está en GitHub:

**https://github.com/AnthonyAmaya/Membres-a-digital-La-Bendicion**

## Subir a Vercel

1. Sube este proyecto a ese repositorio de GitHub (`git push`).
2. En [vercel.com](https://vercel.com) → **Add New → Project** e importa **AnthonyAmaya/Membres-a-digital-La-Bendicion**.
3. Framework: **Next.js**. Node: **22.x**.
4. Añade la variable `SESSION_SECRET`.
5. Deploy.

Framework preset de Next.js es suficiente; no hace falta `vercel.json` especial.

## Colores

El menú y los botones principales usan la paleta del logo: azul océano (`#0077b6`, `#013a63`) y cian (`#48cae4`). El contenido (estados, camino, gráficas) usa otros colores para leerse mejor.
