import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:techgration_app/core/services/storage_service.dart';
import 'package:techgration_app/features/courses/course_hub_screen.dart';
import '../helpers/mock_http_adapter.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({'auth_session_token': 'mock-test-token'});
    await StorageService.init();
    MockHttpClientAdapter.setup();
  });

  group('CourseHubScreen Widget Tests', () {
    testWidgets('Renders Course Player screen with controls and syllabus', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: CourseHubScreen(
              courseId: 'course_ai',
              courseTitle: 'Deep Learning & Neural Networks',
              instructor: 'Dr. Nakul',
            ),
          ),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // Verify app bar title
      expect(find.text('Course Player'), findsOneWidget);
      expect(find.byType(CourseHubScreen), findsOneWidget);
    });

    testWidgets('Back button navigates back', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (ctx) => ElevatedButton(
                onPressed: () => Navigator.push(
                  ctx,
                  MaterialPageRoute(
                    builder: (_) => const ProviderScope(
                      child: CourseHubScreen(
                        courseId: 'course_1',
                        courseTitle: 'Test Course',
                      ),
                    ),
                  ),
                ),
                child: const Text('Open Hub'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Open Hub'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.byType(CourseHubScreen), findsOneWidget);

      // Tap back button
      final backButton = find.byIcon(Icons.arrow_back_ios_new_rounded);
      expect(backButton, findsOneWidget);
      await tester.tap(backButton);
      await tester.pumpAndSettle();

      expect(find.byType(CourseHubScreen), findsNothing);
      expect(find.text('Open Hub'), findsOneWidget);
    });
  });
}
