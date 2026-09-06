-- Seed: cat_financing_type (14 filas)

INSERT INTO `cat_financing_type` (`id`, `description`) VALUES
  (1, 'Banco central'),
  (2, 'Banco comercial'),
  (3, 'Cooperativas de credito'),
  (4, 'Ahorros'),
  (5, 'Prestamos'),
  (6, 'Inversiones'),
  (7, 'Brokers'),
  (8, 'Banco de tienda departamental'),
  (9, 'Servicios financieros'),
  (10, 'Sofipo'),
  (11, 'Afore'),
  (12, 'Cetes'),
  (13, 'Fintech'),
  (99, 'No especificado')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);
