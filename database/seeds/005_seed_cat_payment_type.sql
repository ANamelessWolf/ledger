-- Seed: cat_payment_type (5 filas)

INSERT INTO `cat_payment_type` (`id`, `description`) VALUES
  (1, 'VISA'),
  (2, 'MASTERCARD'),
  (3, 'AMEX'),
  (4, 'DISCOVERY'),
  (99, 'OTHER')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);
