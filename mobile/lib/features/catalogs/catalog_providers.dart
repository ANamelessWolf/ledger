import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers.dart';
import 'data/catalog_repository.dart';
import 'domain/catalog_models.dart';

final catalogRepositoryProvider = Provider<CatalogRepository>(
  (ref) => CatalogRepository(ref.watch(databaseProvider)),
);

/// Cached catalogs, refreshed whenever a catalog table changes.
final catalogsProvider = StreamProvider<Catalogs>(
  (ref) => ref.watch(catalogRepositoryProvider).watch(),
);
