-- Seed: cat_wallet_type (6 filas)

INSERT INTO `cat_wallet_type` (`id`, `description`) VALUES
  (1, 'Efectivo'),
  (2, 'Digital Wallet'),
  (3, 'Credit Card'),
  (4, 'Debit Card'),
  (5, 'Transferencia'),
  (6, 'Credito')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);
