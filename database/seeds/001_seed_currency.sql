-- Seed: currency (7 filas)

INSERT INTO `currency` (`id`, `name`, `symbol`, `conversion`) VALUES
  (1, 'Dólar', 'USD', 17.31),
  (2, 'Peso Mexicano', 'MXN', 1.0),
  (3, 'Bitcoin', 'BTC', 1330779.22),
  (4, 'Yen japonés', 'JPY', 0.1089),
  (5, 'Pesos Chilenos', 'CLP', 0.019),
  (6, 'Euro', 'EUR', 20.13),
  (7, 'Dolar Canadiense', 'CAD', 12.504)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `symbol` = VALUES(`symbol`), `conversion` = VALUES(`conversion`);
