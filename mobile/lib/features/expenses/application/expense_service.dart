import '../../../core/errors/app_exception.dart';
import '../../catalogs/data/catalog_repository.dart';
import '../data/expense_repository.dart';
import '../domain/expense.dart';
import '../domain/expense_draft.dart';

/// Thrown when a draft fails validation; carries per-field messages.
class ExpenseValidationException extends AppException {
  ExpenseValidationException(this.errors) : super('Please fix the highlighted fields.');

  final Map<ExpenseField, String> errors;
}

/// Use cases for local expense management (works fully offline).
class ExpenseService {
  ExpenseService({
    required this._repository,
    required this._catalogs,
    this._validator = const ExpenseValidator(),
  });

  final ExpenseRepository _repository;
  final CatalogRepository _catalogs;
  final ExpenseValidator _validator;

  /// Validates and stores a new pending expense. No network access.
  Future<Expense> create(ExpenseDraft draft) async {
    final value = await _validate(draft);
    return _repository.createLocal(value);
  }

  /// Validates and updates an unsynchronized expense.
  Future<Expense> update(int id, ExpenseDraft draft) async {
    final value = await _validate(draft);
    return _repository.updateLocal(id, value);
  }

  /// Deletes an unsynchronized expense.
  Future<void> delete(int id) => _repository.deleteLocal(id);

  Future<ValidExpense> _validate(ExpenseDraft draft) async {
    final catalogs = await _catalogs.load();
    if (catalogs.isEmpty) {
      throw const DataUnavailableException(
          'Catalogs are not available on this device. Synchronize with Ledger before creating expenses.');
    }
    final result = _validator.validate(draft, catalogs: catalogs);
    if (!result.isValid) throw ExpenseValidationException(result.errors);
    return result.value!;
  }
}
