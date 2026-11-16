import 'package:flutter_test/flutter_test.dart';
import 'package:techgration_app/features/rewards/academics_controller.dart';

void main() {
  group('AcademicsState Unit Tests', () {
    test('Initializes with default empty collections and isLoading', () {
      const state = AcademicsState(isLoading: true);
      expect(state.isLoading, true);
      expect(state.assessments, isEmpty);
      expect(state.rankedStudents, isEmpty);
      expect(state.certificates, isEmpty);
      expect(state.inProgressCourses, isEmpty);
    });

    test('copyWith updates fields without mutating unchanged data', () {
      const initial = AcademicsState(isLoading: true);
      final updated = initial.copyWith(
        isLoading: false,
        selectedCourseId: 'course_ai_101',
        rankedStudents: [
          {'rank': 1, 'name': 'Adarsh', 'xp': 1450},
          {'rank': 2, 'name': 'Nihar', 'xp': 1320},
        ],
        certificates: [
          {
            'id': 'cert_1',
            'courseTitle': 'Artificial Intelligence',
            'verificationCode': 'TG-CERT-2026-AI',
          }
        ],
      );

      expect(updated.isLoading, false);
      expect(updated.selectedCourseId, 'course_ai_101');
      expect(updated.rankedStudents.length, 2);
      expect(updated.certificates.first['verificationCode'], 'TG-CERT-2026-AI');
      expect(updated.assessments, isEmpty);
    });
  });
}
