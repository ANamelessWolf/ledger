# Database setup

Este proyecto administra el esquema y los datos base de `db_ledger` mediante
migraciones y seeds versionados en `migrations/` y `seeds/`. `init.sql` y
`migrate_icons_to_material.sql` quedaron archivados en `legacy/` y ya no se
usan: el contenedor de MySQL arranca vacío y se puebla con los comandos de
abajo.

## Requisitos

- El contenedor de MySQL corriendo (ver `docker-compose.yml` en la raíz del
  repo, servicio `mysql`).
- `backend/.env` con las credenciales de conexión (`DB_HOST`, `DB_PORT`,
  `DB_USER`, `DB_PASSWORD`, `DB_NAME`) — todos los scripts de este proyecto
  se conectan usando ese archivo, no uno propio de `database/`.
- Dependencias instaladas: `npm install`.

## Primer arranque (base de datos vacía)

```bash
npm run db:migrate   # crea el esquema: tablas, vistas y rutinas (migrations/)
npm run db:seed      # carga catálogos base: monedas, tipos, vendors, etc. (seeds/)
```

Ambos comandos son idempotentes: `db:migrate` lleva un registro en la tabla
`schema_migrations` y solo aplica lo que falte; `db:seed` usa
`INSERT ... ON DUPLICATE KEY UPDATE`, así que se puede correr las veces que
haga falta sin duplicar filas.

## Otros comandos

- `npm run db:backup` — genera un dump completo (`mysqldump`) en
  `backups/dump-<db>-<timestamp>.sql`: tablas, datos, vistas, procedimientos,
  triggers y eventos.
- `npm run db:restore -- --file backups/<archivo>.sql` — restaura un backup
  puntual (por default toma el más reciente en `backups/`). **Sobreescribe**
  la base de datos configurada en `backend/.env`; pide confirmación
  (usa `--yes` para saltarla en scripts no interactivos).
- `npm run db:rebuild -- --yes` — borra y recrea la base de datos desde cero
  (`DROP DATABASE` + `CREATE DATABASE`) y vuelve a correr `db:migrate` y
  `db:seed`. Útil para dejar un ambiente de prueba en un estado limpio y
  conocido. **Destructivo**, pide confirmación igual que `db:restore`.

## Agregar una migración o un seed nuevo

- Migraciones: agrega un archivo `NNN_create_..._<nombre>.sql` en
  `migrations/` (numeración secuencial, en orden de dependencias FK) y corre
  `npm run db:migrate`.
- Seeds: agrega un archivo `NNN_seed_<tabla>.sql` en `seeds/` con
  `INSERT ... ON DUPLICATE KEY UPDATE` y corre `npm run db:seed`. Los datos
  fuente en CSV, si los hay, viven en `seeds/data/`.
