import '../../../core/utilities/iso_date.dart';
import '../../catalogs/domain/catalog_models.dart';

/// Maximum description length (`expense.description VARCHAR(120)`).
const int expenseDescriptionMaxLength = 120;

/// Form input for creating or editing a local expense. Fields are nullable
/// because the form may be incomplete; [ExpenseValidator] decides validity.
class ExpenseDraft {
  const ExpenseDraft({
    this.walletId,
    this.expenseTypeId,
    this.vendorId,
    this.description = '',
    this.total,
    this.currencyFactor,
    this.buyDate,
  });

  final int? walletId;
  final int? expenseTypeId;
  final int? vendorId;
  final String description;
  final double? total;
  final double? currencyFactor;

  /// `YYYY-MM-DD`.
  final String? buyDate;
}

/// Field identifiers used to attach validation errors to form fields.
enum ExpenseField { wallet, total, currencyFactor, expenseType, vendor, buyDate, description }

/// A draft that passed validation; every required value is present.
class ValidExpense {
  const ValidExpense({
    required this.walletId,
    required this.expenseTypeId,
    required this.vendorId,
    required this.description,
    required this.total,
    required this.currencyFactor,
    required this.buyDate,
  });

  final int walletId;
  final int expenseTypeId;
  final int vendorId;
  final String description;
  final double total;
  final double? currencyFactor;
  final String buyDate;
}

/// Outcome of validating a draft.
class ExpenseValidationResult {
  const ExpenseValidationResult._(this.errors, this.value);

  /// Field → user-facing error message.
  final Map<ExpenseField, String> errors;
  final ValidExpense? value;

  bool get isValid => value != null;
}

/// Validates expense drafts against the server's `expense` constraints and
/// the locally cached catalogs.
class ExpenseValidator {
  const ExpenseValidator();

  ExpenseValidationResult validate(ExpenseDraft draft, {Catalogs? catalogs}) {
    final errors = <ExpenseField, String>{};

    final walletId = draft.walletId;
    if (walletId == null) {
      errors[ExpenseField.wallet] = 'Select a wallet.';
    } else if (catalogs != null && !catalogs.wallets.containsKey(walletId)) {
      errors[ExpenseField.wallet] = 'This wallet is no longer available. Synchronize catalogs.';
    }

    final total = draft.total;
    if (total == null) {
      errors[ExpenseField.total] = 'Enter the total.';
    } else if (!total.isFinite || total <= 0) {
      errors[ExpenseField.total] = 'The total must be greater than 0.';
    }

    final factor = draft.currencyFactor;
    if (factor != null && (!factor.isFinite || factor <= 0)) {
      errors[ExpenseField.currencyFactor] = 'The factor must be greater than 0, or left empty.';
    }

    if (draft.expenseTypeId == null) {
      errors[ExpenseField.expenseType] = 'Select an expense type.';
    } else if (catalogs != null && catalogs.expenseType(draft.expenseTypeId!) == null) {
      errors[ExpenseField.expenseType] = 'This expense type is no longer available.';
    }

    if (draft.vendorId == null) {
      errors[ExpenseField.vendor] = 'Select a vendor.';
    } else if (catalogs != null && catalogs.vendor(draft.vendorId!) == null) {
      errors[ExpenseField.vendor] = 'This vendor is no longer available.';
    }

    final buyDate = draft.buyDate;
    if (buyDate == null || buyDate.isEmpty) {
      errors[ExpenseField.buyDate] = 'Select the expense date.';
    } else if (!IsoDate.isValid(buyDate)) {
      errors[ExpenseField.buyDate] = 'The date is not valid.';
    }

    final description = draft.description.trim();
    if (description.isEmpty) {
      errors[ExpenseField.description] = 'Enter a description.';
    } else if (description.length > expenseDescriptionMaxLength) {
      errors[ExpenseField.description] = 'Use at most $expenseDescriptionMaxLength characters.';
    }

    if (errors.isNotEmpty) return ExpenseValidationResult._(errors, null);
    return ExpenseValidationResult._(
      const {},
      ValidExpense(
        walletId: walletId!,
        expenseTypeId: draft.expenseTypeId!,
        vendorId: draft.vendorId!,
        description: description,
        total: total!,
        // A factor is meaningless for the default currency (it is always 1).
        currencyFactor: _isDefaultCurrencyWallet(walletId, catalogs) ? null : factor,
        buyDate: buyDate!,
      ),
    );
  }

  bool _isDefaultCurrencyWallet(int walletId, Catalogs? catalogs) =>
      catalogs?.currencyOfWallet(walletId)?.isDefault ?? false;
}
