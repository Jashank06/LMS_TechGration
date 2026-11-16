import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:techgration_app/core/services/storage_service.dart';
import 'package:techgration_app/features/video/recording_player_screen.dart';
import '../helpers/mock_http_adapter.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({'auth_session_token': 'mock-test-token'});
    await StorageService.init();
    MockHttpClientAdapter.setup();

    // Mock video_player platform channel calls
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
      const MethodChannel('flutter.io/videoPlayer'),
      (MethodCall methodCall) async {
        if (methodCall.method == 'init') return null;
        if (methodCall.method == 'create') return {'textureId': 1};
        if (methodCall.method == 'setLooping') return null;
        if (methodCall.method == 'setVolume') return null;
        if (methodCall.method == 'play') return null;
        if (methodCall.method == 'pause') return null;
        if (methodCall.method == 'seekTo') return null;
        if (methodCall.method == 'dispose') return null;
        return null;
      },
    );
  });

  group('RecordingPlayerScreen Widget Tests', () {
    testWidgets('Renders Cinema header, badges, and milestones', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(800, 1200);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: RecordingPlayerScreen(
              classId: 'class_test_1',
              title: 'Live Class: Artificial Intelligence & Modern Deep Learning Systems — Class 6',
              videoUrl: 'https://campus.techgration.live/Recordings/AI/AI_Class_6.mp4',
              courseTitle: 'Artificial Intelligence & Modern Deep Learning Systems',
              instructorName: 'Vineet Sir',
              durationMinutes: 59,
              conductedDate: 'Concluded • 59 mins',
            ),
          ),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));

      // Cinema header bar elements
      expect(find.text('TECHGRATION PLAYER'), findsOneWidget);
      expect(find.text('1080p Full HD'), findsOneWidget);
      expect(find.text('MP4'), findsOneWidget);
      expect(
        find.text('Live Class: Artificial Intelligence & Modern Deep Learning Systems — Class 6'),
        findsOneWidget,
      );

      // Verify Chapters & Milestones tab
      expect(find.text('Chapters & Milestones'), findsOneWidget);
      expect(find.text('Session Details'), findsOneWidget);

      // Verify Class 6 specific chapters
      expect(find.text('Welcome & Class 5 Recap'), findsOneWidget);
      expect(find.text('Transformers, Self-Attention & Encoder-Decoder'), findsOneWidget);

      // Clean up controller
      await tester.pumpWidget(const SizedBox.shrink());
    });

    testWidgets('Switching to Session Details tab shows course overview', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(800, 1200);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: RecordingPlayerScreen(
              classId: 'class_test_2',
              title: 'Live Class: Artificial Intelligence & Modern Deep Learning Systems — Class 5',
              videoUrl: 'https://campus.techgration.live/Recordings/AI/AI_Class_5.mp4',
              courseTitle: 'Artificial Intelligence & Modern Deep Learning Systems',
              instructorName: 'Vineet Sir',
              durationMinutes: 54,
              conductedDate: 'Concluded • 54 mins',
            ),
          ),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));

      // Tap Session Details Tab
      final sessionDetailsTab = find.text('Session Details');
      expect(sessionDetailsTab, findsOneWidget);
      await tester.tap(sessionDetailsTab);
      await tester.pump();

      // Verify Instructor and Description
      expect(find.text('Instructor: Vineet Sir'), findsOneWidget);
      expect(find.text('Class Description & Study Notes'), findsOneWidget);

      // Clean up controller
      await tester.pumpWidget(const SizedBox.shrink());
    });
  });
}
