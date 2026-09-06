FROM mysql:8.0

# MYSQL_ROOT_PASSWORD y MYSQL_DATABASE se pasan en runtime (docker-compose
# environment:, sourced from database/.env) — nunca hardcodeados aquí.
#
# El esquema y los datos tampoco se cargan aquí: el contenedor arranca vacío
# y se puebla corriendo `npm run db:migrate && npm run db:seed` desde el
# proyecto database/ (ver README.md).
