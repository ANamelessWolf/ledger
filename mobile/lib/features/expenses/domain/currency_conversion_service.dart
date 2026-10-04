/// The single place where expense amounts are converted to the default
/// currency. Never duplicate this formula in widgets or other services.
///
/// Direction (verified against the backend): both `currency.conversion` and
/// `expense.currency_factor` are *default-currency units per 1 unit of the
/// wallet currency* — e.g. USD has conversion 17.31 when MXN is the default,
/// and the backend computes `value = expense.total * currency.conversion`.
///
/// Rule:
/// - If the expense has its own factor, use it (the rate when it was spent).
/// - Otherwise use the current catalog conversion of the wallet currency.
///
/// A stored factor of 0 is treated as "no factor", matching Ledger's
/// `COALESCE(NULLIF(currency_factor, 0), conversion)` budget logic.
class CurrencyConversionService {
  const CurrencyConversionService();

  /// The factor that applies to an expense, or null if none is known.
  double? effectiveFactor({required double? currencyFactor, required double? walletCurrencyConversion}) {
    if (currencyFactor != null && currencyFactor > 0) return currencyFactor;
    return walletCurrencyConversion;
  }

  /// [total] (in the wallet currency) expressed in the default currency.
  /// Returns null when no factor is known.
  double? normalize({
    required double total,
    required double? currencyFactor,
    required double? walletCurrencyConversion,
  }) {
    final factor = effectiveFactor(
      currencyFactor: currencyFactor,
      walletCurrencyConversion: walletCurrencyConversion,
    );
    return factor == null ? null : total * factor;
  }

  /// True when the expense uses its own factor rather than the catalog rate.
  bool usesExpenseFactor(double? currencyFactor) => currencyFactor != null && currencyFactor > 0;
}
