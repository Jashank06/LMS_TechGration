import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:techgration_app/core/services/storage_service.dart';
import 'package:techgration_app/features/assignments/assignments_screen.dart';
import '../helpers/mock_http_adapter.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({'auth_session_token': 'mock-test-token'});
    await StorageService.init();
    MockHttpClientAdapter.setup();
  });

  group('AssignmentsScreen Widget Tests', () {
    testWidgets('Renders Assignments screen, header and deliverables section', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: AssignmentsScreen(),
          ),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Assignments'), findsOneWidget);
      expect(find.byType(AssignmentsScreen), findsOneWidget);

      // Verify hero banner
      expect(find.text('Assignments Workspace'), findsOneWidget);
      expect(find.text('PRACTICAL DELIVERABLES'), findsOneWidget);

      // Verify section title
      expect(find.text('Active Deliverables'), findsOneWidget);

      // Verify authentic empty state when no assignments
      expect(find.text('No Active Deliverables'), findsOneWidget);
    });
  });
}
