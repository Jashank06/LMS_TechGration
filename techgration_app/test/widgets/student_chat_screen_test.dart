import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:techgration_app/core/services/storage_service.dart';
import 'package:techgration_app/features/chat/student_chat_screen.dart';
import '../helpers/mock_http_adapter.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({
      'auth_session_token': 'mock-test-token',
      'auth_user_data': '{"id":"user_123","name":"Jay Sharma"}',
    });
    await StorageService.init();
    MockHttpClientAdapter.setup();
  });

  group('StudentChatScreen Widget Tests', () {
    testWidgets('Renders Faculty 1-on-1 Chat screen with mentor details', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: StudentChatScreen(
            teacherName: 'Nakul Sharma',
            initialCourseId: 'course_ai_101',
          ),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // Verify mentor header
      expect(find.text('Nakul Sharma'), findsOneWidget);
      expect(find.text('ONLINE'), findsOneWidget);
      expect(find.byType(StudentChatScreen), findsOneWidget);

      // Verify composer input
      expect(find.byType(TextField), findsOneWidget);
      expect(find.byIcon(Icons.send_rounded), findsOneWidget);

      // Cleanup polling timer
      await tester.pumpWidget(const SizedBox.shrink());
    });

    testWidgets('Typing message in composer and tapping send updates input', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: StudentChatScreen(
            teacherName: 'Course Mentor',
          ),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      final input = find.byType(TextField);
      expect(input, findsOneWidget);

      await tester.enterText(input, 'Hello Sir, when is the next AI masterclass?');
      expect(find.text('Hello Sir, when is the next AI masterclass?'), findsOneWidget);

      // Tap send button
      final sendBtn = find.byIcon(Icons.send_rounded);
      await tester.tap(sendBtn);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // Input should be cleared on optimistic send
      expect(find.widgetWithText(TextField, 'Hello Sir, when is the next AI masterclass?'), findsNothing);

      // Cleanup polling timer
      await tester.pumpWidget(const SizedBox.shrink());
    });
  });
}
