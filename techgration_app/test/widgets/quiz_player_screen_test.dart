import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:techgration_app/core/services/storage_service.dart';
import 'package:techgration_app/features/assessments/quiz_player_screen.dart';
import '../helpers/mock_http_adapter.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({'auth_session_token': 'mock-test-token'});
    await StorageService.init();
    MockHttpClientAdapter.setup();
  });

  group('QuizPlayerScreen Widget Tests', () {
    testWidgets('Renders Quiz Player with questions, options, and countdown timer', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: QuizPlayerScreen(
            assessmentId: 'assessment_test',
            assessmentTitle: 'Deep Learning Evaluation',
          ),
        ),
      );

      // Pump to process microtasks and mock API response
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // Verify question prompt and assessment title
      expect(find.text('Deep Learning Evaluation'), findsOneWidget);
      expect(find.text('Question 1 of 1'), findsOneWidget);
      expect(find.text('Which loss function is used for binary classification?'), findsOneWidget);

      // Verify options
      expect(find.text('Binary Cross-Entropy'), findsOneWidget);
      expect(find.text('Mean Squared Error'), findsOneWidget);

      // Tap an option
      await tester.tap(find.text('Binary Cross-Entropy'));
      await tester.pump();

      // Submit button exists
      expect(find.text('Submit Evaluation 🚀'), findsOneWidget);

      // Clean up timer by navigating away / replacing widget
      await tester.pumpWidget(const SizedBox.shrink());
    });
  });
}
