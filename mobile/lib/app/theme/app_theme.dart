import 'package:flutter/material.dart';

/// Semantic color tokens for the always-dark "OLED fintech" look.
/// Widgets use these tokens (or the derived [ColorScheme]); never raw hex.
abstract final class AppColors {
  static const background = Color(0xFF060A13);
  static const surface = Color(0xFF0B111D);
  static const surfaceContainerLow = Color(0xFF0F1625);
  static const surfaceContainer = Color(0xFF131B2C);
  static const surfaceContainerHigh = Color(0xFF1A2438);
  static const surfaceContainerHighest = Color(0xFF222E46);
  static const outline = Color(0xFF34425F);
  static const outlineVariant = Color(0xFF1F2A40);

  static const primary = Color(0xFF8BA4FF); // trust blue / indigo
  static const onPrimary = Color(0xFF0A1433);
  static const primaryContainer = Color(0xFF1E2C66);
  static const money = Color(0xFF3EE0A1); // mint: amounts, success
  static const moneyContainer = Color(0xFF0E3B2C);
  static const accent = Color(0xFFB79CFF); // violet: charts
  static const warning = Color(0xFFFFC857); // amber: pending
  static const warningContainer = Color(0xFF3D2F0C);
  static const error = Color(0xFFFF7A7A);
  static const errorContainer = Color(0xFF4A1518);

  static const textPrimary = Color(0xFFE8ECF5);
  static const textSecondary = Color(0xFF9AA6BF); // ≥ 4.5:1 on surfaces
  static const textMuted = Color(0xFF6F7C96);

  /// Hero gradient for the dashboard summary card.
  static const heroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF2A3F9E), Color(0xFF4B2E9A), Color(0xFF16205A)],
    stops: [0, 0.55, 1],
  );

  /// Bar colors for ranked dashboard lists.
  static const barGradient = LinearGradient(colors: [primary, accent]);
}

/// Spacing scale (4/8 dp rhythm).
abstract final class Spacing {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const xxl = 32.0;
}

/// Radius tokens.
abstract final class Radii {
  static const card = 20.0;
  static const control = 14.0;
  static const chip = 10.0;
}

/// Amount text style helper: tabular figures avoid width jitter.
TextStyle amountStyle(TextStyle? base) =>
    (base ?? const TextStyle()).copyWith(fontFeatures: const [FontFeature.tabularFigures()]);

/// Builds the Material 3 dark theme.
ThemeData buildAppTheme() {
  const scheme = ColorScheme(
    brightness: Brightness.dark,
    primary: AppColors.primary,
    onPrimary: AppColors.onPrimary,
    primaryContainer: AppColors.primaryContainer,
    onPrimaryContainer: AppColors.textPrimary,
    secondary: AppColors.money,
    onSecondary: Color(0xFF04261A),
    secondaryContainer: AppColors.moneyContainer,
    onSecondaryContainer: AppColors.money,
    tertiary: AppColors.accent,
    onTertiary: Color(0xFF1E1240),
    tertiaryContainer: Color(0xFF2E2260),
    onTertiaryContainer: AppColors.textPrimary,
    error: AppColors.error,
    onError: Color(0xFF3B0A0D),
    errorContainer: AppColors.errorContainer,
    onErrorContainer: Color(0xFFFFDAD8),
    surface: AppColors.surface,
    onSurface: AppColors.textPrimary,
    onSurfaceVariant: AppColors.textSecondary,
    surfaceContainerLowest: AppColors.background,
    surfaceContainerLow: AppColors.surfaceContainerLow,
    surfaceContainer: AppColors.surfaceContainer,
    surfaceContainerHigh: AppColors.surfaceContainerHigh,
    surfaceContainerHighest: AppColors.surfaceContainerHighest,
    outline: AppColors.outline,
    outlineVariant: AppColors.outlineVariant,
    inverseSurface: AppColors.textPrimary,
    onInverseSurface: AppColors.surface,
    inversePrimary: Color(0xFF3550C8),
    shadow: Colors.black,
    scrim: Colors.black,
  );

  final base = ThemeData(useMaterial3: true, colorScheme: scheme, brightness: Brightness.dark);
  final text = base.textTheme.apply(bodyColor: AppColors.textPrimary, displayColor: AppColors.textPrimary);
  final controlShape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(Radii.control));

  return base.copyWith(
    scaffoldBackgroundColor: AppColors.background,
    textTheme: text.copyWith(
      headlineMedium: text.headlineMedium?.copyWith(fontWeight: FontWeight.w700, letterSpacing: -0.5),
      titleLarge: text.titleLarge?.copyWith(fontWeight: FontWeight.w700),
      titleMedium: text.titleMedium?.copyWith(fontWeight: FontWeight.w600),
      labelLarge: text.labelLarge?.copyWith(fontWeight: FontWeight.w600),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.background,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
    ),
    cardTheme: CardThemeData(
      color: AppColors.surfaceContainer,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(Radii.card),
        side: const BorderSide(color: AppColors.outlineVariant),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: AppColors.surface,
      surfaceTintColor: Colors.transparent,
      indicatorColor: AppColors.primaryContainer,
      height: 72,
      labelTextStyle: WidgetStateProperty.resolveWith(
        (states) => TextStyle(
          fontSize: 12,
          fontWeight: states.contains(WidgetState.selected) ? FontWeight.w700 : FontWeight.w500,
          color: states.contains(WidgetState.selected) ? AppColors.textPrimary : AppColors.textSecondary,
        ),
      ),
      iconTheme: WidgetStateProperty.resolveWith(
        (states) => IconThemeData(
          color: states.contains(WidgetState.selected) ? AppColors.primary : AppColors.textSecondary,
        ),
      ),
    ),
    drawerTheme: const DrawerThemeData(
      backgroundColor: AppColors.surface,
      surfaceTintColor: Colors.transparent,
      scrimColor: Color(0x99000000),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        minimumSize: const Size(64, 52),
        shape: controlShape,
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(64, 52),
        shape: controlShape,
        side: const BorderSide(color: AppColors.outline),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(minimumSize: const Size(48, 48), shape: controlShape),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surfaceContainer,
      contentPadding: const EdgeInsets.symmetric(horizontal: Spacing.lg, vertical: Spacing.lg),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Radii.control),
        borderSide: const BorderSide(color: AppColors.outlineVariant),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Radii.control),
        borderSide: const BorderSide(color: AppColors.outlineVariant),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Radii.control),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Radii.control),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Radii.control),
        borderSide: const BorderSide(color: AppColors.error, width: 2),
      ),
      disabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Radii.control),
        borderSide: const BorderSide(color: AppColors.outlineVariant),
      ),
      labelStyle: const TextStyle(color: AppColors.textSecondary),
      helperStyle: const TextStyle(color: AppColors.textSecondary),
      helperMaxLines: 3,
      errorMaxLines: 3,
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: AppColors.surfaceContainerHighest,
      contentTextStyle: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
      actionTextColor: AppColors.primary,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Radii.control)),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: AppColors.surfaceContainerHigh,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: AppColors.surfaceContainerLow,
      surfaceTintColor: Colors.transparent,
      showDragHandle: true,
      modalBarrierColor: Color(0x99000000),
    ),
    datePickerTheme: const DatePickerThemeData(
      backgroundColor: AppColors.surfaceContainerHigh,
      surfaceTintColor: Colors.transparent,
    ),
    listTileTheme: const ListTileThemeData(
      iconColor: AppColors.textSecondary,
      contentPadding: EdgeInsets.symmetric(horizontal: Spacing.lg),
      minVerticalPadding: Spacing.md,
    ),
    dividerTheme: const DividerThemeData(color: AppColors.outlineVariant, space: 1, thickness: 1),
    chipTheme: base.chipTheme.copyWith(
      backgroundColor: AppColors.surfaceContainerHigh,
      selectedColor: AppColors.primaryContainer,
      checkmarkColor: AppColors.primary,
      side: const BorderSide(color: AppColors.outlineVariant),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Radii.chip)),
      labelStyle: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w500),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: AppColors.primary,
      linearTrackColor: AppColors.surfaceContainerHighest,
      circularTrackColor: AppColors.surfaceContainerHighest,
    ),
    pageTransitionsTheme: const PageTransitionsTheme(
      builders: {TargetPlatform.android: PredictiveBackPageTransitionsBuilder()},
    ),
  );
}
