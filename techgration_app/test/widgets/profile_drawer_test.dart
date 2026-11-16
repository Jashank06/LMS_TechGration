import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:techgration_app/core/services/storage_service.dart';
import 'package:techgration_app/features/drawer/profile_drawer.dart';
import '../helpers/mock_http_adapter.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({
      'auth_session_token': 'mock-test-token',
      'auth_user_data': '{"name":"Jay Sharma","email":"jay@techgration.live"}',
    });
    await StorageService.init();
    MockHttpClientAdapter.setup();
  });

  group('ProfileDrawer Widget Tests', () {
    testWidgets('Renders all hub navigation items and categories correctly', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              drawer: ProfileDrawer(),
              body: Center(child: Text('Home')),
            ),
          ),
        ),
      );

      final scaffoldState = tester.state<ScaffoldState>(find.byType(Scaffold));
      scaffoldState.openDrawer();
      await tester.pumpAndSettle();

      // Brand mark
      expect(find.text('TechGration'), findsOneWidget);
      expect(find.text('Student Workspace'), findsOneWidget);

      // Student info
      expect(find.text('Jay Sharma'), findsOneWidget);
      expect(find.text('jay@techgration.live'), findsOneWidget);
      expect(find.text('STUDENT PORTAL'), findsOneWidget);

      // Category Headers
      expect(find.text('ACADEMICS'), findsOneWidget);
      expect(find.text('COMMUNITY & CONNECT'), findsOneWidget);
      expect(find.text('ACCOUNT'), findsOneWidget);

      // Community items
      expect(find.text('Refer & Earn'), findsOneWidget);
      expect(find.text('Faculty 1-on-1 Chat'), findsOneWidget);
      expect(find.text('Community & Notices'), findsOneWidget);

      // Coding Arena item
      expect(find.text('Coding Arena'), findsOneWidget);
      expect(find.text('CHALLENGES'), findsOneWidget);

      // Sign Out Button
      expect(find.text('Sign Out'), findsOneWidget);
    });

    testWidgets('Tapping Sign Out displays confirmation alert dialog', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              drawer: ProfileDrawer(),
              body: Center(child: Text('Home')),
            ),
          ),
        ),
      );

      final scaffoldState = tester.state<ScaffoldState>(find.byType(Scaffold));
      scaffoldState.openDrawer();
      await tester.pumpAndSettle();

      // Tap Sign Out
      await tester.tap(find.text('Sign Out'));
      await tester.pumpAndSettle();

      // Confirmation dialog opens
      expect(find.text('Sign Out?'), findsOneWidget);
      expect(find.text('Are you sure you want to sign out from your TechGration student account?'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);
      expect(find.text('Logout'), findsOneWidget);

      // Tap Cancel closes dialog
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();

      expect(find.text('Sign Out?'), findsNothing);
    });
  });
}
