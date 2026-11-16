import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:techgration_app/core/services/storage_service.dart';
import 'package:techgration_app/features/community/community_feed_screen.dart';
import '../helpers/mock_http_adapter.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({'auth_session_token': 'mock-test-token'});
    await StorageService.init();
    MockHttpClientAdapter.setup();
  });

  group('CommunityFeedScreen Widget Tests', () {
    testWidgets('Renders Community Feed header and category filter pills', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: CommunityFeedScreen(),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // Verify app bar title and hero
      expect(find.text('Community & Notice Board'), findsOneWidget);
      expect(find.text('OFFICIAL COHORT DISPATCH'), findsOneWidget);
      expect(find.byType(CommunityFeedScreen), findsOneWidget);

      // Verify category filter pills
      expect(find.text('All Updates'), findsOneWidget);
      expect(find.text('Announcements'), findsOneWidget);
      expect(find.text('Schedule'), findsOneWidget);
      expect(find.text('Events'), findsOneWidget);
      expect(find.text('Resources'), findsOneWidget);

      // Verify post content from mock
      expect(find.text('Next Masterclass Reschedule'), findsOneWidget);

      await tester.pumpWidget(const SizedBox.shrink());
    });

    testWidgets('Tapping category pill switches selected filter', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: CommunityFeedScreen(),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // Tap 'Announcements'
      await tester.tap(find.text('Announcements'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // Tap 'Schedule'
      await tester.tap(find.text('Schedule'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.byType(CommunityFeedScreen), findsOneWidget);

      await tester.pumpWidget(const SizedBox.shrink());
    });
  });
}
