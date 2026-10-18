import 'package:flutter/services.dart';

/// Central Tactile Haptics Engine for TechGration Mobile App
/// Delivers realistic physical vibration feedback on iOS & Android
class HapticService {
  /// Subtle crisp click for tabs, filter pills, and checkboxes
  static void selection() {
    HapticFeedback.selectionClick();
  }

  /// Light tactile bounce on button touches, typing, and list item taps
  static void lightTap() {
    HapticFeedback.lightImpact();
  }

  /// Solid tactile punch on primary action buttons (Continue, Next, FAB)
  static void mediumImpact() {
    HapticFeedback.mediumImpact();
  }

  /// Warning vibration on invalid OTP code or network error
  static void heavyImpact() {
    HapticFeedback.heavyImpact();
  }

  /// Celebratory double pulse on OTP success, mission completion, live class join
  static Future<void> success() async {
    HapticFeedback.mediumImpact();
    await Future.delayed(const Duration(milliseconds: 90));
    HapticFeedback.lightImpact();
  }

  /// Error vibration
  static Future<void> error() async {
    HapticFeedback.heavyImpact();
    await Future.delayed(const Duration(milliseconds: 100));
    HapticFeedback.heavyImpact();
  }
}
