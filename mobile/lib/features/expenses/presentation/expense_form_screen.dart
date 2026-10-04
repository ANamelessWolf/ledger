import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_theme.dart';
import '../../../core/errors/app_exception.dart';
import '../../../core/formatting/formatters.dart';
import '../../../core/providers.dart';
import '../../../core/utilities/iso_date.dart';
import '../../../shared/widgets/category_icon.dart';
import '../../../shared/widgets/picker_sheet.dart';
import '../../../shared/widgets/state_views.dart';
import '../../catalogs/catalog_providers.dart';
import '../../catalogs/domain/catalog_models.dart';
import '../application/expense_service.dart';
import '../domain/currency_conversion_service.dart';
import '../domain/expense.dart';
import '../domain/expense_draft.dart';
import '../expense_providers.dart';

/// Create (or edit) a local expense. Works fully offline: catalogs come from
/// SQLite and saving only writes to SQLite.
///
/// [embedded] = shown as the "New Expense" tab; otherwise pushed as a route
/// (editing). [onFinished] is called after Save/Cancel in embedded mode.
class ExpenseFormScreen extends ConsumerStatefulWidget {
  const ExpenseFormScreen({super.key, this.expense, this.embedded = false, this.onFinished});

  final Expense? expense;
  final bool embedded;
  final VoidCallback? onFinished;

  static Route<void> editRoute(Expense expense) =>
      MaterialPageRoute(builder: (_) => ExpenseFormScreen(expense: expense), fullscreenDialog: true);

  @override
  ConsumerState<ExpenseFormScreen> createState() => _ExpenseFormScreenState();
}

class _ExpenseFormScreenState extends ConsumerState<ExpenseFormScreen> {
  final _totalController = TextEditingController();
  final _factorController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _totalFocus = FocusNode();

  /// Selected account (`WalletAccount.key`) and the wallet resolved from it.
  String? _accountKey;
  int? _walletId;
  int? _expenseTypeId;
  int? _vendorId;
  late String _buyDate;
  Map<ExpenseField, String> _errors = const {};
  bool _saving = false;
  bool _dirty = false;

  bool get _isEdit => widget.expense != null;

  @override
  void initState() {
    super.initState();
    final e = widget.expense;
    _buyDate = e?.buyDate ?? IsoDate.format(ref.read(clockProvider)());
    if (e != null) {
      _walletId = e.walletId;
      _expenseTypeId = e.expenseTypeId;
      _vendorId = e.vendorId;
      _totalController.text = Formatters.amount(e.total);
      _factorController.text = e.currencyFactor == null ? '' : Formatters.factor(e.currencyFactor!);
      _descriptionController.text = e.description;
    }
    _totalFocus.addListener(_formatTotalOnBlur);
    for (final c in [_totalController, _factorController, _descriptionController]) {
      c.addListener(_markDirty);
    }
  }

  @override
  void dispose() {
    _totalController.dispose();
    _factorController.dispose();
    _descriptionController.dispose();
    _totalFocus.dispose();
    super.dispose();
  }

  void _markDirty() {
    if (!_dirty) setState(() => _dirty = true);
    // Refresh the live conversion preview.
    setState(() {});
  }

  void _formatTotalOnBlur() {
    if (_totalFocus.hasFocus) return;
    final value = Formatters.parseAmount(_totalController.text);
    if (value != null && value > 0) _totalController.text = Formatters.amount(value);
  }

  ExpenseDraft _draft() => ExpenseDraft(
        walletId: _walletId,
        expenseTypeId: _expenseTypeId,
        vendorId: _vendorId,
        description: _descriptionController.text,
        total: Formatters.parseAmount(_totalController.text),
        currencyFactor: _factorController.text.trim().isEmpty ? null : (Formatters.parseAmount(_factorController.text) ?? double.nan),
        buyDate: _buyDate,
      );

  Future<void> _save() async {
    FocusScope.of(context).unfocus();
    setState(() => _saving = true);
    final service = ref.read(expenseServiceProvider);
    try {
      if (_isEdit) {
        await service.update(widget.expense!.id, _draft());
      } else {
        await service.create(_draft());
      }
      if (!mounted) return;
      showAppSnackBar(context, _isEdit ? 'Expense updated' : 'Expense saved on this device. Sync to send it to Ledger.');
      _finish();
    } on ExpenseValidationException catch (e) {
      setState(() => _errors = e.errors);
    } catch (e) {
      if (mounted) showAppSnackBar(context, userMessageFor(e), error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _finish() {
    if (widget.embedded) {
      widget.onFinished?.call();
    } else {
      Navigator.of(context).pop();
    }
  }

  Future<void> _cancel() async {
    if (_dirty || _walletId != null && !_isEdit) {
      final discard = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Discard changes?'),
          content: const Text('The information you entered will be lost.'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Keep editing')),
            FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Discard')),
          ],
        ),
      );
      if (discard != true) return;
    }
    if (mounted) _finish();
  }

  /// Applies an account + wallet selection. The factor is cleared when the
  /// currency changes, since it is specific to one currency.
  void _selectWallet(WalletAccount account, WalletOption wallet) {
    if (wallet.wallet.id != _walletId) _factorController.clear();
    _accountKey = account.key;
    _walletId = wallet.wallet.id;
  }

  void _set(VoidCallback change, ExpenseField field) => setState(() {
        change();
        _dirty = true;
        _errors = {..._errors}..remove(field);
      });

  @override
  Widget build(BuildContext context) {
    final catalogsAsync = ref.watch(catalogsProvider);
    final title = _isEdit ? 'Edit expense' : 'New expense';

    return PopScope(
      canPop: widget.embedded || !_dirty,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop && !widget.embedded) _cancel();
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(title),
          leading: widget.embedded
              ? null
              : IconButton(tooltip: 'Cancel', icon: const Icon(Icons.close_rounded), onPressed: _cancel),
          automaticallyImplyLeading: !widget.embedded,
        ),
        body: switch (catalogsAsync) {
          AsyncData(:final value) when value.isEmpty => const EmptyState(
              icon: Icons.inventory_2_outlined,
              title: 'Catalogs not available',
              message:
                  'Wallets, vendors and expense types must be synchronized from Ledger before you can create expenses. Connect to Ledger and run a synchronization.',
            ),
          AsyncData(:final value) => _form(context, value),
          AsyncError() => const ErrorState(message: 'The catalogs on this device could not be read.'),
          _ => const Center(child: CircularProgressIndicator()),
        },
        bottomNavigationBar: catalogsAsync.value?.isEmpty ?? true
            ? null
            : SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(Spacing.lg, Spacing.sm, Spacing.lg, Spacing.md),
                  child: Row(
                    children: [
                      Expanded(child: OutlinedButton(onPressed: _saving ? null : _cancel, child: const Text('Cancel'))),
                      const SizedBox(width: Spacing.md),
                      Expanded(
                        flex: 2,
                        child: FilledButton.icon(
                          onPressed: _saving ? null : _save,
                          icon: _saving
                              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                              : const Icon(Icons.check_rounded),
                          label: const Text('Save'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  Widget _form(BuildContext context, Catalogs catalogs) {
    final theme = Theme.of(context);
    // "Wallet" in the form is the account (wallet group); the concrete wallet
    // sent to Ledger is resolved from account + currency.
    final account = (_accountKey == null ? null : catalogs.accountByKey(_accountKey!)) ??
        (_walletId == null ? null : catalogs.accountOfWallet(_walletId!));
    final currency = _walletId == null ? null : catalogs.currencyOfWallet(_walletId!);
    final defaultCurrency = catalogs.defaultCurrency;
    final isForeign = currency != null && !currency.isDefault;
    final currencyChoices = account?.currencies ?? const <Currency>[];
    final type = _expenseTypeId == null ? null : catalogs.expenseType(_expenseTypeId!);
    final vendor = _vendorId == null ? null : catalogs.vendor(_vendorId!);

    return ListView(
      padding: const EdgeInsets.fromLTRB(Spacing.lg, Spacing.sm, Spacing.lg, Spacing.xl),
      children: [
        _sectionLabel(theme, 'Account'),
        PickerField(
          label: 'Wallet *',
          icon: Icons.account_balance_wallet_rounded,
          value: account?.label,
          errorText: _errors[ExpenseField.wallet],
          onTap: () async {
            final result = await showPickerSheet<String>(
              context: context,
              title: 'Wallet',
              selected: account?.key,
              options: [
                for (final a in catalogs.walletAccounts.where((a) => a.isSelectable || a.key == account?.key))
                  PickerOption(
                    value: a.key,
                    label: a.label,
                    subtitle: a.currencies.map((c) => c.symbol).join(' · '),
                    searchText: a.currencies.map((c) => c.symbol).join(' '),
                  ),
              ],
            );
            final picked = result?.value == null ? null : catalogs.accountByKey(result!.value!);
            if (picked != null) {
              // Keep the chosen currency when the new account has it; otherwise
              // fall back to the account's default (the default currency).
              _set(() => _selectWallet(picked, picked.resolve(currency?.id)), ExpenseField.wallet);
            }
          },
        ),
        const SizedBox(height: Spacing.md),
        PickerField(
          label: 'Currency',
          icon: Icons.currency_exchange_rounded,
          value: currency == null ? null : '${currency.symbol} · ${currency.name}',
          enabled: currencyChoices.length > 1,
          showChevron: currencyChoices.length > 1,
          placeholder: '',
          helperText: account == null
              ? 'Select a wallet first'
              : currencyChoices.length > 1
                  ? 'Currencies available in ${account.label}'
                  : 'The only currency of ${account.label}',
          onTap: () async {
            final result = await showPickerSheet<int>(
              context: context,
              title: 'Currency',
              selected: currency?.id,
              options: [
                for (final c in currencyChoices)
                  PickerOption(value: c.id, label: c.symbol, subtitle: c.name + (c.isDefault ? ' · default' : '')),
              ],
            );
            final chosen = result?.value == null ? null : account!.walletForCurrency(result!.value!);
            if (chosen != null) _set(() => _selectWallet(account!, chosen), ExpenseField.wallet);
          },
        ),
        _sectionLabel(theme, 'Amount'),
        TextField(
          controller: _totalController,
          focusNode: _totalFocus,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.,]'))],
          style: amountStyle(theme.textTheme.titleLarge),
          decoration: InputDecoration(
            labelText: 'Total *',
            prefixIcon: const Icon(Icons.payments_rounded),
            prefixText: '\$ ',
            suffixText: currency?.symbol,
            errorText: _errors[ExpenseField.total],
          ),
          onChanged: (_) => setState(() => _errors = {..._errors}..remove(ExpenseField.total)),
        ),
        // The factor only applies to non-default currencies.
        AnimatedSize(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOutCubic,
          alignment: Alignment.topCenter,
          child: !isForeign
              ? const SizedBox(width: double.infinity)
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: Spacing.md),
                    TextField(
                      controller: _factorController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.,]'))],
                      style: amountStyle(theme.textTheme.bodyLarge),
                      decoration: InputDecoration(
                        labelText: 'Currency factor (optional)',
                        prefixIcon: const Icon(Icons.swap_horiz_rounded),
                        errorText: _errors[ExpenseField.currencyFactor],
                        helperText: _factorHelp(currency, defaultCurrency),
                      ),
                      onChanged: (_) => setState(() => _errors = {..._errors}..remove(ExpenseField.currencyFactor)),
                    ),
                    _ConversionPreview(
                      total: Formatters.parseAmount(_totalController.text),
                      factorText: _factorController.text,
                      currency: currency,
                      defaultCurrency: defaultCurrency,
                    ),
                  ],
                ),
        ),
        _sectionLabel(theme, 'Details'),
        PickerField(
          label: 'Expense type *',
          leading: null,
          icon: CategoryIcons.resolve(type?.icon),
          value: type?.name,
          errorText: _errors[ExpenseField.expenseType],
          onTap: () async {
            final result = await showPickerSheet<int>(
              context: context,
              title: 'Expense type',
              selected: _expenseTypeId,
              options: [
                for (final t in catalogs.expenseTypes)
                  PickerOption(value: t.id, label: t.name, leading: CategoryAvatar(iconName: t.icon, size: 36)),
              ],
            );
            if (result?.value != null) _set(() => _expenseTypeId = result!.value, ExpenseField.expenseType);
          },
        ),
        const SizedBox(height: Spacing.md),
        PickerField(
          label: 'Vendor *',
          icon: Icons.storefront_rounded,
          value: vendor?.name,
          errorText: _errors[ExpenseField.vendor],
          onTap: () async {
            final result = await showPickerSheet<int>(
              context: context,
              title: 'Vendor',
              selected: _vendorId,
              options: [for (final v in catalogs.vendors) PickerOption(value: v.id, label: v.name)],
            );
            if (result?.value != null) _set(() => _vendorId = result!.value, ExpenseField.vendor);
          },
        ),
        const SizedBox(height: Spacing.md),
        PickerField(
          label: 'Expense date *',
          icon: Icons.event_rounded,
          value: Formatters.longDate(_buyDate),
          errorText: _errors[ExpenseField.buyDate],
          onTap: () async {
            final picked = await showDatePicker(
              context: context,
              initialDate: IsoDate.tryParse(_buyDate) ?? DateTime.now(),
              firstDate: DateTime(2000),
              lastDate: DateTime(2100),
            );
            if (picked != null) _set(() => _buyDate = IsoDate.format(picked), ExpenseField.buyDate);
          },
        ),
        const SizedBox(height: Spacing.md),
        TextField(
          controller: _descriptionController,
          maxLength: expenseDescriptionMaxLength,
          maxLengthEnforcement: MaxLengthEnforcement.enforced,
          minLines: 2,
          maxLines: 4,
          textCapitalization: TextCapitalization.sentences,
          decoration: InputDecoration(
            labelText: 'Description *',
            alignLabelWithHint: true,
            prefixIcon: const Padding(padding: EdgeInsets.only(bottom: 24), child: Icon(Icons.notes_rounded)),
            errorText: _errors[ExpenseField.description],
          ),
          onChanged: (_) => setState(() => _errors = {..._errors}..remove(ExpenseField.description)),
        ),
        if (_errors.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: Spacing.sm),
            child: Text('Please fix the highlighted fields.', style: TextStyle(color: theme.colorScheme.error)),
          ),
      ],
    );
  }

  String? _factorHelp(Currency? currency, Currency? defaultCurrency) {
    if (currency == null) return 'Select a wallet first.';
    final def = defaultCurrency?.symbol ?? 'default currency';
    if (currency.isDefault) return 'Not needed: $def is the default currency.';
    return 'How many $def one ${currency.symbol} was worth for this expense. '
        'Leave empty to use the current catalog rate (1 ${currency.symbol} = ${Formatters.factor(currency.conversion)} $def).';
  }

  Widget _sectionLabel(ThemeData theme, String text) => Padding(
        padding: const EdgeInsets.fromLTRB(Spacing.xs, Spacing.xl, 0, Spacing.md),
        child: Text(text.toUpperCase(),
            style: theme.textTheme.labelSmall?.copyWith(color: AppColors.textMuted, letterSpacing: 1.2, fontWeight: FontWeight.w700)),
      );
}

/// Live preview of the normalized amount, using the central conversion rule.
class _ConversionPreview extends StatelessWidget {
  const _ConversionPreview({required this.total, required this.factorText, required this.currency, required this.defaultCurrency});

  final double? total;
  final String factorText;
  final Currency currency;
  final Currency? defaultCurrency;

  @override
  Widget build(BuildContext context) {
    final factor = factorText.trim().isEmpty ? null : Formatters.parseAmount(factorText);
    const conversion = CurrencyConversionService();
    final value = total == null
        ? null
        : conversion.normalize(total: total!, currencyFactor: factor, walletCurrencyConversion: currency.conversion);
    if (value == null) return const SizedBox.shrink();
    final source = conversion.usesExpenseFactor(factor) ? 'your factor' : 'catalog rate';
    return Padding(
      padding: const EdgeInsets.only(top: Spacing.sm),
      child: Container(
        padding: const EdgeInsets.all(Spacing.md),
        decoration: BoxDecoration(
          color: AppColors.moneyContainer.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(Radii.control),
        ),
        child: Row(children: [
          const Icon(Icons.calculate_rounded, size: 18, color: AppColors.money),
          const SizedBox(width: Spacing.sm),
          Expanded(
            child: Text(
              '≈ ${Formatters.money(value, defaultCurrency?.symbol ?? '')} using $source',
              style: amountStyle(const TextStyle(color: AppColors.money, fontWeight: FontWeight.w600)),
            ),
          ),
        ]),
      ),
    );
  }
}
