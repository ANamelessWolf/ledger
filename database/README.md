# Database setup

1. Use the `init.sql` to setup the database start up file.

2. Create the database Dockerfile

```Dockerfile
FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=mydatabase

COPY init.sql /docker-entrypoint-initdb.d/
```