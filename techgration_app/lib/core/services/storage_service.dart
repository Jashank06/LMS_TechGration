import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _keyToken = 'auth_session_token';
  static const String _keyUser = 'auth_user_data';
  static const String _keyOnboarded = 'has_seen_onboarding';

  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  // Token management
  static Future<void> setSessionToken(String token) async {
    await init();
    await _prefs?.setString(_keyToken, token);
  }

  static String? getSessionToken() {
    return _prefs?.getString(_keyToken);
  }

  static bool get isAuthenticated => getSessionToken() != null && getSessionToken()!.isNotEmpty;

  // User Profile Data
  static Future<void> setUserData(Map<String, dynamic> userData) async {
    await init();
    await _prefs?.setString(_keyUser, jsonEncode(userData));
  }

  static Map<String, dynamic>? getUserData() {
    final str = _prefs?.getString(_keyUser);
    if (str == null) return null;
    try {
      return jsonDecode(str) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  // Onboarding flag
  static Future<void> setOnboarded(bool value) async {
    await init();
    await _prefs?.setBool(_keyOnboarded, value);
  }

  static bool get hasSeenOnboarding {
    return _prefs?.getBool(_keyOnboarded) ?? false;
  }

  // Clear Session (Logout)
  static Future<void> clearSession() async {
    await init();
    await _prefs?.remove(_keyToken);
    await _prefs?.remove(_keyUser);
  }
}
