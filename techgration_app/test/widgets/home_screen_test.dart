import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:techgration_app/core/services/storage_service.dart';
import 'package:techgration_app/features/chat/student_chat_screen.dart';
import 'package:techgration_app/features/community/community_feed_screen.dart';
import 'package:techgration_app/features/dashboard/home_screen.dart';
import 'package:techgration_app/features/referral/refer_earn_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({
      'auth_session_token': 'mock-test-token',
      'auth_user_data': '{"name":"Jay Sharma","email":"jay@techgration.live"}',
    });
    await StorageService.init();
  });

  group('HomeScreen Widget Tests', () {
    testWidgets('Renders Home brand header, greeting, metrics, and cashback banner', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: HomeScreen(onOpenDrawer: () {}),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Brand mark
      expect(find.text('TechGration'), findsOneWidget);
      expect(find.text('Student Workspace'), findsOneWidget);

      // Refer & Earn ₹500 Cashback banner
      expect(find.text('Refer & Earn ₹500'), findsOneWidget);
      expect(find.text('CASHBACK'), findsOneWidget);

      // Learning Overview section
      expect(find.text('Learning Overview 📊'), findsOneWidget);
    });

    testWidgets('Tapping notification bell navigates to Community & Notices', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: HomeScreen(onOpenDrawer: () {}),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Tap Notification Icon
      final notifIcon = find.byIcon(Icons.notifications_none_rounded);
      expect(notifIcon, findsOneWidget);
      await tester.tap(notifIcon);
      await tester.pumpAndSettle();

      expect(find.byType(CommunityFeedScreen), findsOneWidget);
    });

    testWidgets('Tapping faculty chat icon navigates to StudentChatScreen', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: HomeScreen(onOpenDrawer: () {}),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Tap Chat Icon
      final chatIcon = find.byIcon(Icons.forum_outlined);
      expect(chatIcon, findsOneWidget);
      await tester.tap(chatIcon);
      await tester.pumpAndSettle();

      expect(find.byType(StudentChatScreen), findsOneWidget);
    });

    testWidgets('Tapping Refer & Earn banner navigates to ReferEarnScreen', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: HomeScreen(onOpenDrawer: () {}),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Tap banner
      await tester.tap(find.text('Refer & Earn ₹500'));
      await tester.pumpAndSettle();

      expect(find.byType(ReferEarnScreen), findsOneWidget);
    });
  });
}
