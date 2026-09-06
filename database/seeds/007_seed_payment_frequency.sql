-- Seed: payment_frequency (6 filas)

INSERT INTO `payment_frequency` (`id`, `name`, `months`, `years`) VALUES
  (1, 'Mensual', 1, 0),
  (2, 'Trimestral', 3, 0),
  (3, 'Anual', 0, 1),
  (4, '28 Meses', 4, 2),
  (5, 'Semestral', 6, 0),
  (6, 'único', 0, 0)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `months` = VALUES(`months`), `years` = VALUES(`years`);
