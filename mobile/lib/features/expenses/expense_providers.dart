import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers.dart';
import '../catalogs/catalog_providers.dart';
import 'application/expense_service.dart';
import 'application/expense_view_mapper.dart';
import 'data/expense_repository.dart';
import 'domain/expense.dart';

final expenseRepositoryProvider = Provider<ExpenseRepository>(
  (ref) => ExpenseRepository(ref.watch(databaseProvider), clock: ref.watch(clockProvider)),
);

final expenseServiceProvider = Provider<ExpenseService>(
  (ref) => ExpenseService(
    repository: ref.watch(expenseRepositoryProvider),
    catalogs: ref.watch(catalogRepositoryProvider),
  ),
);

final expenseViewMapperProvider = Provider<ExpenseViewMapper>((ref) => const ExpenseViewMapper());

/// One expense joined with catalogs; null when it no longer exists.
final expenseViewProvider = StreamProvider.family<ExpenseView?, int>((ref, id) async* {
  final catalogs = await ref.watch(catalogsProvider.future);
  final mapper = ref.watch(expenseViewMapperProvider);
  yield* ref.watch(expenseRepositoryProvider).watchById(id).map((e) => e == null ? null : mapper.map(e, catalogs));
});
