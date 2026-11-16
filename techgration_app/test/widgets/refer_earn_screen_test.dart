import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:techgration_app/core/services/storage_service.dart';
import 'package:techgration_app/features/referral/refer_earn_screen.dart';
import '../helpers/mock_http_adapter.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({'auth_session_token': 'mock-test-token'});
    await StorageService.init();
    MockHttpClientAdapter.setup();
  });

  group('ReferEarnScreen Widget Tests', () {
    testWidgets('Renders Refer & Earn screen elements cleanly with mock data', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ReferEarnScreen(),
        ),
      );

      // Pump to process microtasks and mock API response
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // Verify header and title
      expect(find.text('Refer & Earn ₹500'), findsOneWidget);
      expect(find.byType(ReferEarnScreen), findsOneWidget);

      // Verify cashback banner text
      expect(find.text('Refer Friends & Earn ₹500 Cashback'), findsOneWidget);
      expect(find.text('UNLIMITED CASHBACK REWARDS'), findsOneWidget);

      // Verify Share on WhatsApp button
      expect(find.text('Share Invite via WhatsApp'), findsOneWidget);

      // Verify metrics cards
      expect(find.text('Friends Invited'), findsOneWidget);
      expect(find.text('Cashback Earned'), findsOneWidget);
    });

    testWidgets('Back button navigates back', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (ctx) => ElevatedButton(
                onPressed: () => Navigator.push(
                  ctx,
                  MaterialPageRoute(builder: (_) => const ReferEarnScreen()),
                ),
                child: const Text('Go To Refer'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Go To Refer'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.byType(ReferEarnScreen), findsOneWidget);

      final backButton = find.byIcon(Icons.arrow_back_ios_new_rounded);
      expect(backButton, findsOneWidget);
      await tester.tap(backButton);
      await tester.pumpAndSettle();

      expect(find.byType(ReferEarnScreen), findsNothing);
      expect(find.text('Go To Refer'), findsOneWidget);
    });
  });
}
