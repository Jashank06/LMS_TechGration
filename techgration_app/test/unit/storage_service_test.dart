import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:techgration_app/core/services/storage_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await StorageService.init();
  });

  group('StorageService Unit Tests', () {
    test('Session token can be stored, retrieved and checked', () async {
      expect(StorageService.isAuthenticated, false);
      expect(StorageService.getSessionToken(), isNull);

      await StorageService.setSessionToken('tg_test_token_12345');

      expect(StorageService.getSessionToken(), 'tg_test_token_12345');
      expect(StorageService.isAuthenticated, true);
    });

    test('User data can be saved and deserialized accurately', () async {
      expect(StorageService.getUserData(), isNull);

      final mockUser = {
        'id': 'user_999',
        'name': 'Jay Sharma',
        'email': 'jay@techgration.live',
        'role': 'STUDENT',
        'profile': {
          'phone': '+919911752744',
          'bio': 'TechGration AI Intern',
        },
      };

      await StorageService.setUserData(mockUser);

      final retrieved = StorageService.getUserData();
      expect(retrieved, isNotNull);
      expect(retrieved!['name'], 'Jay Sharma');
      expect(retrieved['email'], 'jay@techgration.live');
      expect(retrieved['profile']['phone'], '+919911752744');
    });

    test('Onboarding flag can be set and checked', () async {
      expect(StorageService.hasSeenOnboarding, false);

      await StorageService.setOnboarded(true);

      expect(StorageService.hasSeenOnboarding, true);
    });

    test('clearSession removes token and user data completely', () async {
      await StorageService.setSessionToken('token_to_wipe');
      await StorageService.setUserData({'name': 'Temporary User'});

      expect(StorageService.isAuthenticated, true);

      await StorageService.clearSession();

      expect(StorageService.getSessionToken(), isNull);
      expect(StorageService.isAuthenticated, false);
      expect(StorageService.getUserData(), isNull);
    });
  });
}
