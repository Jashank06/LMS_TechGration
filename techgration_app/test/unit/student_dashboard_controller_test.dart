import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:techgration_app/core/services/storage_service.dart';
import 'package:techgration_app/features/dashboard/student_dashboard_controller.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await StorageService.init();
  });

  group('StudentDashboardState Calculations', () {
    test('Calculates metrics correctly from stats and collections', () {
      const state = StudentDashboardState(
        stats: {
          'enrolledCoursesCount': 3,
          'avgProgress': 68,
          'completedLessonsCount': 24,
          'hoursInvested': '14.5 hrs',
          'passedQuizzesCount': 5,
          'certificatesCount': 2,
        },
        assignments: [
          {'id': 'a1', 'status': 'PENDING'},
          {'id': 'a2', 'status': 'GRADED'},
          {'id': 'a3', 'status': 'PENDING'},
          {'id': 'a4', 'status': 'SUBMITTED'},
        ],
      );

      expect(state.enrolledCoursesCount, 3);
      expect(state.avgProgress, 68);
      expect(state.completedLessonsCount, 24);
      expect(state.hoursInvested, '14.5 hrs');
      expect(state.passedQuizzesCount, 5);
      expect(state.certificatesCount, 2);
      expect(state.pendingAssignmentsCount, 2);
    });

    test('activeCourse returns null when enrollments are empty', () {
      const state = StudentDashboardState(enrollments: []);
      expect(state.activeCourse, isNull);
    });

    test('activeCourse prioritizes Artificial Intelligence course', () {
      final state = StudentDashboardState(
        enrollments: [
          {
            'courseId': 'course_web_dev',
            'progressPct': 45.0,
            'course': {
              'id': 'course_web_dev',
              'title': 'Full Stack Web Development',
              'category': 'WEB',
              'instructor': {'name': 'Amit Kumar'},
              'thumbnailUrl': 'https://example.com/web.png',
            },
          },
          {
            'courseId': '6ad283b4e196d0b8fbfb9eae',
            'progressPct': 80.0,
            'course': {
              'id': '6ad283b4e196d0b8fbfb9eae',
              'title': 'Artificial Intelligence & Machine Learning',
              'category': 'AI_ML',
              'instructor': {'name': 'Dr. Sharma'},
              'thumbnailUrl': 'https://example.com/ai.png',
            },
          },
        ],
      );

      final active = state.activeCourse;
      expect(active, isNotNull);
      expect(active!['id'], '6ad283b4e196d0b8fbfb9eae');
      expect(active['title'], 'Artificial Intelligence & Machine Learning');
      expect(active['progressPct'], 80.0);
    });

    test('copyWith updates state cleanly', () {
      const initial = StudentDashboardState(isLoading: true);
      final updated = initial.copyWith(
        isLoading: false,
        stats: {'avgProgress': 95},
      );

      expect(updated.isLoading, false);
      expect(updated.avgProgress, 95);
    });
  });
}
