-- Migration: create routine `GetCreditCardByWalletId`

DROP PROCEDURE IF EXISTS `GetCreditCardByWalletId`;
DELIMITER ;;
CREATE PROCEDURE `GetCreditCardByWalletId`(IN p_wallet_id INT)
BEGIN
  SELECT cc.*
  FROM credit_card cc
  INNER JOIN wallet_group wg ON cc.wallet_group_id = wg.id
  INNER JOIN wallet_member wm ON wm.wallet_group_id = wg.id
  WHERE wm.wallet_id = p_wallet_id;
END ;;
DELIMITER ;
