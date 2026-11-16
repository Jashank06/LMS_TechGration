import 'dart:convert';
import 'dart:typed_data';
import 'package:dio/dio.dart';
import 'package:techgration_app/core/network/api_client.dart';

class MockHttpClientAdapter implements HttpClientAdapter {
  final Map<String, dynamic> customResponses;

  MockHttpClientAdapter([this.customResponses = const {}]);

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    final path = options.path;

    if (customResponses.containsKey(path)) {
      return ResponseBody.fromString(
        jsonEncode(customResponses[path]),
        200,
        headers: {
          Headers.contentTypeHeader: [Headers.jsonContentType],
        },
      );
    }

    // Default payloads for common app endpoints
    dynamic payload = {'success': true};

    if (path.contains('/api/student/dashboard')) {
      payload = {
        'success': true,
        'user': {
          'id': 'user_123',
          'name': 'Jay Sharma',
          'email': 'jay@techgration.live',
          'role': 'STUDENT',
        },
        'stats': {
          'enrolledCoursesCount': 2,
          'avgProgress': 72,
          'completedLessonsCount': 18,
          'hoursInvested': '12.0 hrs',
          'passedQuizzesCount': 3,
          'certificatesCount': 1,
        },
        'enrollments': [
          {
            'courseId': 'course_ai',
            'progressPct': 80.0,
            'course': {
              'id': 'course_ai',
              'title': 'Artificial Intelligence & ML',
              'category': 'AI_ML',
              'instructor': {'name': 'Nakul Sharma'},
              'thumbnailUrl': '',
            },
          },
        ],
        'liveClasses': [],
        'assignments': [],
      };
    } else if (path.contains('/api/student/refer')) {
      payload = {
        'success': true,
        'stats': {
          'referralCode': 'TG-TEST88',
          'totalInvited': 4,
          'totalEnrolled': 2,
          'cashbackEarned': 1000,
          'referrals': [
            {
              'id': 'ref_1',
              'name': 'Adarsh',
              'email': 'a***h@gmail.com',
              'joinedAt': '2026-11-15T00:00:00.000Z',
              'status': 'ENROLLED_CASHBACK_ELIGIBLE',
            },
          ],
        },
      };
    } else if (path.contains('/api/student/assessments/')) {
      payload = {
        'success': true,
        'assessment': {
          'id': 'assessment_test',
          'title': 'Deep Learning Evaluation',
          'timeLimitMinutes': 15,
          'passingPct': 70,
          'questionCount': 1,
          'questions': [
            {
              'id': 'q_1',
              'prompt': 'Which loss function is used for binary classification?',
              'points': 10,
              'options': [
                {'id': 'opt_1', 'text': 'Binary Cross-Entropy'},
                {'id': 'opt_2', 'text': 'Mean Squared Error'},
              ],
            },
          ],
        },
      };
    } else if (path.contains('/api/chat/conversations')) {
      payload = {
        'success': true,
        'conversations': [
          {
            'id': 'conv_1',
            'teacher': {'name': 'Nakul Sharma'},
            'course': {'title': 'Artificial Intelligence'},
            'messages': [
              {
                'id': 'msg_1',
                'content': 'Welcome to TechGration AI Mentor Chat!',
                'senderRole': 'TEACHER',
                'createdAt': '2026-11-17T02:00:00.000Z',
              },
            ],
          },
        ],
      };
    } else if (path.contains('/api/community/posts')) {
      payload = {
        'success': true,
        'posts': [
          {
            'id': 'post_1',
            'title': 'Next Masterclass Reschedule',
            'content': 'The Sunday live class will commence at 6:00 PM IST.',
            'category': 'SCHEDULE',
            'author': {'name': 'TechGration Admin'},
            'createdAt': '2026-11-17T00:00:00.000Z',
            'reactions': {'thumbsUp': 12, 'heart': 8, 'rocket': 15, 'fire': 10},
          },
        ],
      };
    } else if (path.contains('/api/community/pinned')) {
      payload = {
        'success': true,
        'pinned': [],
      };
    } else if (path.contains('/api/student/certificates')) {
      payload = {
        'success': true,
        'certificates': [],
        'inProgressCourses': [],
      };
    } else if (path.contains('/api/student/leaderboard')) {
      payload = {
        'success': true,
        'courses': [],
        'ranked': [],
        'waiting': [],
        'stats': {},
      };
    } else if (path.contains('/api/student/live-classes')) {
      payload = {
        'success': true,
        'upcoming': [],
        'recordings': [],
      };
    }

    return ResponseBody.fromString(
      jsonEncode(payload),
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}

  static void setup([Map<String, dynamic> customResponses = const {}]) {
    ApiClient.dio.httpClientAdapter = MockHttpClientAdapter(customResponses);
  }
}
