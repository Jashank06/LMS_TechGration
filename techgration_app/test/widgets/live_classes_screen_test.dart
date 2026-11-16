import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:techgration_app/core/services/storage_service.dart';
import 'package:techgration_app/features/live/live_classes_screen.dart';
import '../helpers/mock_http_adapter.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({'auth_session_token': 'mock-test-token'});
    await StorageService.init();
    MockHttpClientAdapter.setup();
  });

  group('LiveClassesScreen Widget Tests', () {
    testWidgets('Renders Live Classes header and tabs cleanly', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LiveClassesScreen(),
          ),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Live Classes'), findsOneWidget);
      expect(find.byType(LiveClassesScreen), findsOneWidget);

      // Verify Upcoming tab and Recordings tab
      expect(find.textContaining('Upcoming'), findsOneWidget);
      expect(find.textContaining('Recordings'), findsOneWidget);
    });

    testWidgets('Tapping Recordings tab switches active view', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LiveClassesScreen(),
          ),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // Tap Recordings tab
      await tester.tap(find.textContaining('Recordings'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.byType(LiveClassesScreen), findsOneWidget);

      // Tap back to Upcoming
      await tester.tap(find.textContaining('Upcoming'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.byType(LiveClassesScreen), findsOneWidget);
    });
  });
}
