import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_theme.dart';
import '../../../core/configuration/api_config.dart';
import '../../../core/providers.dart';
import '../../synchronization/domain/sync_models.dart';
import '../../synchronization/sync_providers.dart';
import '../application/api_status.dart';
import '../application/connection_tester.dart';

/// Configure the Ledger API host and port, test it and save it.
class ApiConfigScreen extends ConsumerStatefulWidget {
  const ApiConfigScreen({super.key});

  static Route<void> route() => MaterialPageRoute(builder: (_) => const ApiConfigScreen());

  @override
  ConsumerState<ApiConfigScreen> createState() => _ApiConfigScreenState();
}

class _ApiConfigScreenState extends ConsumerState<ApiConfigScreen> {
  late final TextEditingController _host;
  late final TextEditingController _port;
  ConnectionTestResult? _result;
  bool _testing = false;

  @override
  void initState() {
    super.initState();
    final current = ref.read(apiConfigProvider);
    _host = TextEditingController(text: current == null ? '' : '${current.scheme == 'https' ? 'https://' : ''}${current.host}');
    _port = TextEditingController(text: '${current?.port ?? ApiConfig.defaultPort}');
  }

  @override
  void dispose() {
    _host.dispose();
    _port.dispose();
    super.dispose();
  }

  (ApiConfig?, String?) _parse() {
    try {
      return (ApiConfig.fromInput(hostInput: _host.text, portInput: _port.text), null);
    } on FormatException catch (e) {
      return (null, e.message);
    }
  }

  Future<void> _test() async {
    final (config, _) = _parse();
    if (config == null) return;
    setState(() {
      _testing = true;
      _result = null;
    });
    final result = await ref.read(connectionTesterProvider).test(config);
    if (mounted) {
      setState(() {
        _testing = false;
        _result = result;
      });
    }
  }

  Future<void> _save() async {
    final (config, _) = _parse();
    if (config == null) return;
    final firstSetup = !ref.read(initialSetupProvider);
    await ref.read(apiConfigProvider.notifier).save(config);
    if (!mounted) return;
    // Read everything needed before popping: this state is disposed afterwards.
    final syncController = ref.read(syncControllerProvider.notifier);
    final apiStatus = ref.read(apiStatusProvider.notifier);
    final messenger = ScaffoldMessenger.of(context);
    Navigator.of(context).pop();
    if (firstSetup) {
      // Home shows the initial synchronization progress.
      syncController.run(SyncKind.initial);
    } else {
      messenger.showSnackBar(SnackBar(content: Text('API saved: ${config.baseUrl}')));
      apiStatus.check();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final (config, error) = _parse();
    final firstSetup = !ref.watch(initialSetupProvider);
    final syncing = ref.watch(syncControllerProvider.select((s) => s.running));

    return Scaffold(
      appBar: AppBar(title: const Text('API connection')),
      body: ListView(
        padding: const EdgeInsets.all(Spacing.lg),
        children: [
          Text(
            'Ledger runs on your own server. Enter the address of the Ledger API (the backend, not the web app).',
            style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: Spacing.xl),
          TextField(
            controller: _host,
            keyboardType: TextInputType.url,
            autocorrect: false,
            decoration: const InputDecoration(
              labelText: 'API URL / Host',
              hintText: '192.168.1.100',
              prefixIcon: Icon(Icons.dns_rounded),
            ),
            onChanged: (_) => setState(() => _result = null),
          ),
          const SizedBox(height: Spacing.md),
          TextField(
            controller: _port,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            decoration: const InputDecoration(
              labelText: 'Port',
              hintText: '3002',
              prefixIcon: Icon(Icons.numbers_rounded),
            ),
            onChanged: (_) => setState(() => _result = null),
          ),
          const SizedBox(height: Spacing.lg),
          Container(
            padding: const EdgeInsets.all(Spacing.lg),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLow,
              borderRadius: BorderRadius.circular(Radii.control),
              border: Border.all(color: error == null ? AppColors.outlineVariant : AppColors.error),
            ),
            child: Row(
              children: [
                Icon(error == null ? Icons.link_rounded : Icons.link_off_rounded,
                    color: error == null ? AppColors.primary : AppColors.error),
                const SizedBox(width: Spacing.md),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Base URL', style: theme.textTheme.labelSmall?.copyWith(color: AppColors.textSecondary)),
                    const SizedBox(height: 2),
                    SelectableText(
                      config?.baseUrl ?? error ?? '',
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.w600,
                        color: error == null ? AppColors.textPrimary : AppColors.error,
                      ),
                    ),
                  ]),
                ),
              ],
            ),
          ),
          if (config?.pointsToDeviceItself ?? false)
            const _Hint(
              icon: Icons.phone_android_rounded,
              color: AppColors.warning,
              text: 'On a phone, "localhost" means the phone itself. Use your computer\'s LAN IP (e.g. 192.168.1.100), '
                  'or 10.0.2.2 from the Android emulator.',
            ),
          const SizedBox(height: Spacing.lg),
          OutlinedButton.icon(
            onPressed: config == null || _testing ? null : _test,
            icon: _testing
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.network_check_rounded),
            label: Text(_testing ? 'Testing…' : 'Test connection'),
          ),
          if (_result != null)
            _Hint(
              icon: _result!.isSuccess ? Icons.check_circle_rounded : Icons.error_outline_rounded,
              color: _result!.isSuccess ? AppColors.money : AppColors.error,
              text: _result!.message,
            ),
          const SizedBox(height: Spacing.xl),
          const _Hint(
            icon: Icons.info_outline_rounded,
            color: AppColors.primary,
            text: 'Emulator: use 10.0.2.2 to reach your computer.\n'
                'Physical device: use your computer\'s LAN IP and make sure both are on the same network '
                'and that port 3002 is allowed by the firewall.',
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(Spacing.lg, Spacing.sm, Spacing.lg, Spacing.md),
          child: FilledButton.icon(
            onPressed: config == null || syncing ? null : _save,
            icon: Icon(firstSetup ? Icons.download_rounded : Icons.save_rounded),
            label: Text(firstSetup ? 'Save and synchronize' : 'Save'),
          ),
        ),
      ),
    );
  }
}

class _Hint extends StatelessWidget {
  const _Hint({required this.icon, required this.color, required this.text});

  final IconData icon;
  final Color color;
  final String text;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(top: Spacing.md),
        child: Container(
          padding: const EdgeInsets.all(Spacing.md),
          decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(Radii.control)),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: Spacing.md),
            Expanded(child: Text(text, style: const TextStyle(height: 1.4))),
          ]),
        ),
      );
}
