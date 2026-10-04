import 'package:flutter/material.dart';

import '../../app/theme/app_theme.dart';

/// Maps the icon names stored in Ledger's `cat_expense_type.icon` (Material
/// names plus a few legacy "group/name" values) to Flutter Material icons.
abstract final class CategoryIcons {
  static const IconData fallback = Icons.receipt_long_rounded;

  static const Map<String, IconData> _byName = {
    'account_balance': Icons.account_balance_rounded,
    'attach_money': Icons.attach_money_rounded,
    'blender': Icons.blender_rounded,
    'build': Icons.build_rounded,
    'business': Icons.business_rounded,
    'cake': Icons.cake_rounded,
    'calendar_month': Icons.calendar_month_rounded,
    'camera': Icons.camera_alt_rounded,
    'card_giftcard': Icons.card_giftcard_rounded,
    'casino': Icons.casino_rounded,
    'coffee': Icons.coffee_rounded,
    'computer': Icons.computer_rounded,
    'confirmation_number': Icons.confirmation_number_rounded,
    'content_cut': Icons.content_cut_rounded,
    'credit_card': Icons.credit_card_rounded,
    'currency_exchange': Icons.currency_exchange_rounded,
    'directions_car': Icons.directions_car_rounded,
    'dry_cleaning': Icons.dry_cleaning_rounded,
    'fastfood': Icons.fastfood_rounded,
    'favorite': Icons.favorite_rounded,
    'flight': Icons.flight_rounded,
    'gamepad': Icons.sports_esports_rounded,
    'hotel': Icons.hotel_rounded,
    'house': Icons.house_rounded,
    'icecream': Icons.icecream_rounded,
    'landmark': Icons.account_balance_rounded,
    'local_activity': Icons.local_activity_rounded,
    'local_gas_station': Icons.local_gas_station_rounded,
    'local_parking': Icons.local_parking_rounded,
    'medical_services': Icons.medical_services_rounded,
    'medication': Icons.medication_rounded,
    'memory': Icons.memory_rounded,
    'menu_book': Icons.menu_book_rounded,
    'monetization_on': Icons.monetization_on_rounded,
    'palette': Icons.palette_rounded,
    'payments': Icons.payments_rounded,
    'percent': Icons.percent_rounded,
    'receipt': Icons.receipt_rounded,
    'savings': Icons.savings_rounded,
    'school': Icons.school_rounded,
    'self_improvement': Icons.self_improvement_rounded,
    'set_meal': Icons.set_meal_rounded,
    'shopping_bag': Icons.shopping_bag_rounded,
    'shopping_basket': Icons.shopping_basket_rounded,
    'smartphone': Icons.smartphone_rounded,
    'sports_bar': Icons.sports_bar_rounded,
    'store': Icons.store_rounded,
    'theater_comedy': Icons.theater_comedy_rounded,
    'train': Icons.train_rounded,
    'trending_down': Icons.trending_down_rounded,
    'trending_up': Icons.trending_up_rounded,
    'tv': Icons.tv_rounded,
    'visibility': Icons.visibility_rounded,
    // Legacy Font Awesome-style names.
    'house-chimney-window': Icons.cottage_rounded,
    'kitchen-set': Icons.kitchen_rounded,
    'laptop-code': Icons.laptop_rounded,
    'tablet-screen-button': Icons.tablet_android_rounded,
    'entertainment/art': Icons.brush_rounded,
    'entertainment/baseball': Icons.sports_baseball_rounded,
    'entertainment/person-hiking': Icons.hiking_rounded,
    'entertainment/spa': Icons.spa_rounded,
    'entertainment/utensils': Icons.restaurant_rounded,
    'finance/coins': Icons.toll_rounded,
    'finance/money-transfer': Icons.swap_horiz_rounded,
    'health/assurance': Icons.health_and_safety_rounded,
    'health/nutrition': Icons.restaurant_menu_rounded,
    'health/tooth': Icons.medical_services_rounded,
    'other/cow': Icons.pets_rounded,
    'shopping/bottle-water': Icons.water_drop_rounded,
    'shopping/candy-cane': Icons.cookie_rounded,
    'shopping/clean-bottle': Icons.sanitizer_rounded,
    'shopping/leanpub': Icons.menu_book_rounded,
    'shopping/motorcycle': Icons.two_wheeler_rounded,
    'shopping/pump-soap': Icons.soap_rounded,
    'shopping/shirt': Icons.checkroom_rounded,
  };

  static IconData resolve(String? name) => name == null ? fallback : (_byName[name] ?? fallback);
}

/// Rounded tinted square with the expense category icon.
class CategoryAvatar extends StatelessWidget {
  const CategoryAvatar({super.key, required this.iconName, this.size = 44, this.color});

  final String? iconName;
  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final tint = color ?? AppColors.primary;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: tint.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(size * 0.32),
      ),
      child: Icon(CategoryIcons.resolve(iconName), size: size * 0.5, color: tint),
    );
  }
}
