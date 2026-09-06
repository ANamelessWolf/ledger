-- Migration: create routine `GetMonthlyInterestPaymentsSummary`

DROP PROCEDURE IF EXISTS `GetMonthlyInterestPaymentsSummary`;
DELIMITER ;;
CREATE PROCEDURE `GetMonthlyInterestPaymentsSummary`()
BEGIN
    /*
      Resumen de pagos de mensualidades (is_paid = 1)
      en 3 ventanas: 1, 6 y 12 meses.
      Cada fila incluye:
        - frequency: 1, 6, 12
        - total_mxn: suma en MXN (e.total * c.conversion)
        - payments_count: número de pagos
    */

    -- Último mes
    SELECT 
        1 AS frequency,
        SUM(e.total * c.conversion) AS totalMxn,
        COUNT(*) AS paymentsCount
    FROM monthly_with_no_interest_payments mp
    INNER JOIN expense e 
        ON e.id = mp.expense_id
    INNER JOIN wallet w
        ON w.id = e.wallet_id
    INNER JOIN currency c
        ON c.id = w.currency_id
    WHERE 
        mp.is_paid = 1
        AND e.buy_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)

    UNION ALL

    -- Últimos 6 meses
    SELECT 
        6 AS frequency,
        SUM(e.total * c.conversion) AS totalMxn,
        COUNT(*) AS paymentsCount
    FROM monthly_with_no_interest_payments mp
    INNER JOIN expense e 
        ON e.id = mp.expense_id
    INNER JOIN wallet w
        ON w.id = e.wallet_id
    INNER JOIN currency c
        ON c.id = w.currency_id
    WHERE 
        mp.is_paid = 1
        AND e.buy_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)

    UNION ALL

    -- Últimos 12 meses
    SELECT 
        12 AS frequency,
        SUM(e.total * c.conversion) AS totalMxn,
        COUNT(*) AS paymentsCount
    FROM monthly_with_no_interest_payments mp
    INNER JOIN expense e 
        ON e.id = mp.expense_id
    INNER JOIN wallet w
        ON w.id = e.wallet_id
    INNER JOIN currency c
        ON c.id = w.currency_id
    WHERE 
        mp.is_paid = 1
        AND e.buy_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH);
END ;;
DELIMITER ;
