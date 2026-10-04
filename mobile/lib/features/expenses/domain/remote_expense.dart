/// An expense as downloaded from `GET /expenses`.
class RemoteExpense {
  const RemoteExpense({
    required this.id,
    required this.walletId,
    required this.expenseTypeId,
    required this.vendorId,
    required this.description,
    required this.total,
    required this.currencyFactor,
    required this.buyDate,
    required this.sortId,
  });

  final int id;
  final int walletId;
  final int expenseTypeId;
  final int vendorId;
  final String description;
  final double total;
  final double? currencyFactor;

  /// `YYYY-MM-DD`.
  final String buyDate;
  final int sortId;
}
