import 'package:flutter/material.dart';

class AppColors {
  // Pure surfaces
  static const Color background = Color(0xFFFFFFFF);
  static const Color surfaceLight = Color(0xFFF6F7F9);
  static const Color surfaceCard = Color(0xFFFFFFFF);
  static const Color surfaceMuted = Color(0xFFF1F3F5);

  // High contrast primary dark
  static const Color primaryDark = Color(0xFF0F1015);
  static const Color primaryDarkHover = Color(0xFF1E2028);

  // Vibrant Accents (Under 25 & TechGration style)
  static const Color accentOrange = Color(0xFFFF5500);
  static const Color accentOrangeLight = Color(0xFFFFF2EC);
  static const Color accentBlue = Color(0xFF0052FF);
  static const Color accentBlueLight = Color(0xFFEEF3FF);
  static const Color accentTeal = Color(0xFF00D1B2);
  static const Color accentPurple = Color(0xFF7928CA);

  // Golden / Amber Campus Monogram
  static const Color goldStart = Color(0xFFFFD043);
  static const Color goldEnd = Color(0xFFFF8E1D);

  // Text hierarchy
  static const Color textPrimary = Color(0xFF0B0C0E);
  static const Color textSecondary = Color(0xFF6E737E);
  static const Color textMuted = Color(0xFF9AA0A6);
  static const Color textWhite = Color(0xFFFFFFFF);

  // Borders & Dividers
  static const Color borderLight = Color(0xFFE8EAED);
  static const Color borderSubtle = Color(0xFFF0F1F3);
  static const Color divider = Color(0xFFE5E7EB);

  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);

  // Soft ambient shadows
  static List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.04),
          blurRadius: 18,
          offset: const Offset(0, 6),
        ),
      ];

  static List<BoxShadow> get buttonShadow => [
        BoxShadow(
          color: primaryDark.withValues(alpha: 0.18),
          blurRadius: 16,
          offset: const Offset(0, 6),
        ),
      ];

  static List<BoxShadow> get orangeFabShadow => [
        BoxShadow(
          color: accentOrange.withValues(alpha: 0.35),
          blurRadius: 20,
          offset: const Offset(0, 8),
        ),
      ];
}
