-- Migration: create view `vw_wallet_list`

CREATE OR REPLACE VIEW `vw_wallet_list` AS select `wg`.`id` AS `walletGroupId`,`w`.`id` AS `walletId`,`c`.`id` AS `currencyId`,`wg`.`name` AS `wallet`,`c`.`symbol` AS `currency` from (((`wallet_group` `wg` join `wallet_member` `wm` on((`wm`.`wallet_group_id` = `wg`.`id`))) left join `wallet` `w` on((`w`.`id` = `wm`.`wallet_id`))) left join `currency` `c` on((`c`.`id` = `w`.`currency_id`)));
