import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:techgration_app/core/services/storage_service.dart';
import 'package:techgration_app/features/rewards/rewards_screen.dart';
import '../helpers/mock_http_adapter.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({'auth_session_token': 'mock-test-token'});
    await StorageService.init();
    MockHttpClientAdapter.setup();
  });

  group('RewardsScreen Widget Tests', () {
    testWidgets('Renders Academics Center screen with Assessments, Leaderboard and Certificates tabs', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: RewardsScreen(),
          ),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Academics Center'), findsOneWidget);
      expect(find.byType(RewardsScreen), findsOneWidget);

      // Verify segmented tab labels
      expect(find.text('Assessments'), findsOneWidget);
      expect(find.text('Leaderboard'), findsOneWidget);
      expect(find.text('Certificates'), findsOneWidget);
    });

    testWidgets('Tapping Leaderboard tab switches view cleanly', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: RewardsScreen(),
          ),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // Tap Leaderboard tab
      await tester.tap(find.text('Leaderboard'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.byType(RewardsScreen), findsOneWidget);

      // Tap Certificates tab
      await tester.tap(find.text('Certificates'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.byType(RewardsScreen), findsOneWidget);
    });
  });
}
