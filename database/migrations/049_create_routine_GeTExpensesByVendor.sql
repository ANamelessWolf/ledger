-- Migration: create routine `GeTExpensesByVendor`

DROP PROCEDURE IF EXISTS `GeTExpensesByVendor`;
DELIMITER ;;
CREATE PROCEDURE `GeTExpensesByVendor`(
    IN p_months INT
)
BEGIN
    /*
      Resume los gastos por vendor en los últimos p_months meses,
      excluyendo:
        - Gastos que son compras a meses sin intereses
        - Gastos que son pagos de esas compras
      Todos los montos se regresan en MXN usando currency.conversion
    */

    SELECT 
        cv.id AS vendorId,
        cv.description AS vendor,
        SUM(e.total * c.conversion) AS totalMxn
    FROM expense e
    INNER JOIN cat_vendor cv 
        ON cv.id = e.vendor_id
    INNER JOIN wallet w
        ON w.id = e.wallet_id
    INNER JOIN currency c
        ON c.id = w.currency_id
    WHERE 
        e.buy_date >= DATE_SUB(CURDATE(), INTERVAL p_months MONTH)
        -- excluir gasto padre de mensualidades
        AND NOT EXISTS (
            SELECT 1
            FROM monthly_with_no_interest m
            WHERE m.expense_id = e.id
        )
        -- excluir gastos que sean pagos de mensualidades
        AND NOT EXISTS (
            SELECT 1
            FROM monthly_with_no_interest_payments mp
            WHERE mp.expense_id = e.id
        )
    GROUP BY 
        cv.id,
        cv.description
    ORDER BY 
        totalMxn DESC;
END ;;
DELIMITER ;
