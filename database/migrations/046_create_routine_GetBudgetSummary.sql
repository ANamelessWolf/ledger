-- Migration: create routine `GetBudgetSummary`

DROP PROCEDURE IF EXISTS `GetBudgetSummary`;
DELIMITER ;;
CREATE PROCEDURE `GetBudgetSummary`(
  IN p_owner_id    INT,
  IN p_start_date  DATE,
  IN p_end_date    DATE,
  IN p_annual_budget TINYINT
)
BEGIN
  SELECT
    b.id AS budget_id, b.description, b.icon,
    ROUND(b.total * bc.conversion, 2) AS budget_total,
    ROUND(COALESCE(SUM(e.total * COALESCE(NULLIF(e.currency_factor, 0), wc.conversion)), 0), 2) AS spent_total,
    ROUND(b.total * bc.conversion - COALESCE(SUM(e.total * COALESCE(NULLIF(e.currency_factor, 0), wc.conversion)), 0), 2) AS remaining
  FROM budget b
  JOIN currency bc ON b.currency_id = bc.id
  LEFT JOIN budget_item_detail bid ON bid.budget_id = b.id
  LEFT JOIN expense e ON ((bid.item_type = 1 AND e.expense_type_id = bid.item_id) OR (bid.item_type = 2 AND e.vendor_id = bid.item_id))
    AND e.buy_date BETWEEN p_start_date AND p_end_date
  LEFT JOIN wallet w ON e.wallet_id = w.id
  LEFT JOIN currency wc ON w.currency_id = wc.id
  WHERE b.owner_id = p_owner_id AND b.annual_budget = p_annual_budget
  GROUP BY b.id, b.description, b.icon, b.total, bc.conversion;
END ;;
DELIMITER ;
