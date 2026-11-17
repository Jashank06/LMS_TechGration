import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';
import '../../core/network/endpoints.dart';
import '../../core/services/storage_service.dart';

class StudentDashboardState {
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? user;
  final Map<String, dynamic>? stats;
  final List<dynamic> enrollments;
  final List<dynamic> liveClasses;
  final List<dynamic> recordings;
  final List<dynamic> assignments;
  final List<Map<String, dynamic>> past7DaysData;

  const StudentDashboardState({
    this.isLoading = false,
    this.error,
    this.user,
    this.stats,
    this.enrollments = const [],
    this.liveClasses = const [],
    this.recordings = const [],
    this.assignments = const [],
    this.past7DaysData = const [],
  });

  StudentDashboardState copyWith({
    bool? isLoading,
    String? error,
    Map<String, dynamic>? user,
    Map<String, dynamic>? stats,
    List<dynamic>? enrollments,
    List<dynamic>? liveClasses,
    List<dynamic>? recordings,
    List<dynamic>? assignments,
    List<Map<String, dynamic>>? past7DaysData,
  }) {
    return StudentDashboardState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      user: user ?? this.user,
      stats: stats ?? this.stats,
      enrollments: enrollments ?? this.enrollments,
      liveClasses: liveClasses ?? this.liveClasses,
      recordings: recordings ?? this.recordings,
      assignments: assignments ?? this.assignments,
      past7DaysData: past7DaysData ?? this.past7DaysData,
    );
  }

  // Real LMS Metric Getters
  int get enrolledCoursesCount =>
      (stats?['enrolledCoursesCount'] as int?) ?? enrollments.length;

  int get avgProgress =>
      (stats?['avgProgressPct'] as num?)?.toInt() ??
      (stats?['avgProgress'] as num?)?.toInt() ??
      0;

  int get completedLessonsCount => (stats?['completedLessonsCount'] as int?) ?? 0;

  String get hoursInvested => (stats?['hoursInvested'] as String?) ?? '0.0 hrs';

  int get passedQuizzesCount => (stats?['passedQuizzesCount'] as int?) ?? 0;

  int get certificatesCount => (stats?['certificatesCount'] as int?) ?? 0;

  int get pendingAssignmentsCount {
    if (assignments.isEmpty) return 0;
    return assignments.where((a) {
      if (a is! Map) return false;
      final status = a['status']?.toString().toUpperCase() ?? 'PENDING';
      return status == 'PENDING';
    }).length;
  }

  Map<String, dynamic>? get activeCourse {
    if (enrollments.isNotEmpty) {
      // Prioritize "Artificial Intelligence" course
      final aiMatch = enrollments.cast<Map<String, dynamic>?>().firstWhere(
        (e) {
          if (e == null) return false;
          final title = (e['course']?['title'] ?? e['title'] ?? '').toString().toLowerCase();
          final id = (e['courseId'] ?? e['id'] ?? '').toString();
          return title.contains('artificial intelligence') || id == '6ad283b4e196d0b8fbfb9eae';
        },
        orElse: () => null,
      );
      final first = aiMatch ?? (enrollments.first as Map<String, dynamic>);
      final course = (first['course'] as Map<String, dynamic>?) ?? {};
      return {
        'id': first['courseId'] ?? course['id'] ?? first['id'] ?? '',
        'title': course['title'] ?? first['title'] ?? 'Enrolled Course',
        'category': course['category'] ?? first['category'] ?? 'TECHNOLOGY',
        'instructor': course['instructor']?['name'] ?? first['instructor'] ?? 'Course Faculty',
        'thumbnailUrl': course['thumbnailUrl'] ?? first['thumbnailUrl'] ?? '',
        'progressPct': (first['progressPct'] as num?)?.toDouble() ?? 0.0,
      };
    }
    return null;
  }
}

class StudentDashboardNotifier extends Notifier<StudentDashboardState> {
  @override
  StudentDashboardState build() {
    // Initial state initialized with cached logged-in user
    final cachedUser = StorageService.getUserData();
    final defaultPast7Days = [
      {'day': 'Mon', 'minutes': 0, 'label': '0m'},
      {'day': 'Tue', 'minutes': 0, 'label': '0m'},
      {'day': 'Wed', 'minutes': 0, 'label': '0m'},
      {'day': 'Thu', 'minutes': 0, 'label': '0m'},
      {'day': 'Fri', 'minutes': 0, 'label': '0m'},
      {'day': 'Sat', 'minutes': 0, 'label': '0m'},
      {'day': 'Sun', 'minutes': 0, 'label': '0m'},
    ];

    Future.microtask(() => loadDashboard());

    return StudentDashboardState(
      isLoading: false,
      user: cachedUser,
      past7DaysData: defaultPast7Days,
      enrollments: const [],
      liveClasses: const [],
      assignments: const [],
    );
  }

  Future<void> loadDashboard() async {
    state = state.copyWith(isLoading: true, error: null);

    final res = await ApiClient.get(Endpoints.studentDashboard);

    if (res.success && res.data is Map) {
      final data = res.data as Map<String, dynamic>;
      final user = data['user'] as Map<String, dynamic>?;
      final rawEnrollments = (data['enrollments'] as List<dynamic>?) ?? [];
      final enrollments = List<dynamic>.from(rawEnrollments)..sort((a, b) {
        final mapA = a as Map<String, dynamic>;
        final mapB = b as Map<String, dynamic>;
        final titleA = (mapA['course']?['title'] ?? mapA['title'] ?? '').toString().toLowerCase();
        final idA = (mapA['courseId'] ?? mapA['id'] ?? '').toString();
        final isAiA = titleA.contains('artificial intelligence') || idA == '6ad283b4e196d0b8fbfb9eae';

        final titleB = (mapB['course']?['title'] ?? mapB['title'] ?? '').toString().toLowerCase();
        final idB = (mapB['courseId'] ?? mapB['id'] ?? '').toString();
        final isAiB = titleB.contains('artificial intelligence') || idB == '6ad283b4e196d0b8fbfb9eae';

        if (isAiA && !isAiB) return -1;
        if (!isAiA && isAiB) return 1;
        return 0;
      });

      List<dynamic> liveClasses = (data['liveClasses'] as List<dynamic>?) ?? [];
      final assignments = (data['assignments'] as List<dynamic>?) ?? [];

      List<dynamic> recordings = [];
      try {
        final lcRes = await ApiClient.get(Endpoints.liveClasses);
        if (lcRes.success && lcRes.data is Map) {
          final lcMap = lcRes.data as Map<String, dynamic>;
          recordings = (lcMap['recordings'] as List<dynamic>?) ?? [];
          final apiLive = (lcMap['liveClasses'] as List<dynamic>?) ?? [];
          if (liveClasses.isEmpty && apiLive.isNotEmpty) {
            liveClasses = apiLive;
          }
        }
      } catch (_) {}

      final past7DaysRaw = data['past7DaysData'] as List<dynamic>?;
      final past7DaysData = past7DaysRaw != null
          ? past7DaysRaw
              .whereType<Map>()
              .map((item) => Map<String, dynamic>.from(item))
              .toList()
          : state.past7DaysData;

      state = state.copyWith(
        isLoading: false,
        user: user ?? state.user,
        stats: data['stats'] as Map<String, dynamic>?,
        enrollments: enrollments,
        liveClasses: liveClasses,
        recordings: recordings,
        assignments: assignments,
        past7DaysData: past7DaysData,
      );

      if (user != null) {
        await StorageService.setUserData(user);
      }

      // If production /api/student/live-classes returned empty recordings, hydrate
      // real class recordings & upcoming live sessions from enrolled course details
      if (recordings.isEmpty && enrollments.isNotEmpty) {
        await _hydrateRecordingsFromCourses(enrollments);
      }
    } else {
      if (res.statusCode == 401) {
        await StorageService.clearSession();
      }
      state = state.copyWith(
        isLoading: false,
        error: res.error,
        user: StorageService.getUserData() ?? state.user,
      );
    }
  }

  Future<void> _hydrateRecordingsFromCourses(List<dynamic> enrollments) async {
    final courseIds = <String>[];
    for (final e in enrollments) {
      if (e is! Map) continue;
      final cid = (e['courseId'] ?? e['course']?['id'] ?? e['id'] ?? '').toString().trim();
      if (cid.isNotEmpty && !courseIds.contains(cid)) {
        courseIds.add(cid);
      }
    }
    if (courseIds.isEmpty) return;

    final seenRecIds = <String>{};
    final hydratedRecordings = <Map<String, dynamic>>[];
    final seenLiveIds = <String>{
      for (final lc in state.liveClasses)
        if (lc is Map && lc['id'] != null) lc['id'].toString(),
    };
    final hydratedLive = List<dynamic>.from(state.liveClasses);

    // Query enrolled courses in parallel to collect all real recordings & live classes
    final results = await Future.wait(
      courseIds.map((cid) async {
        try {
          return await ApiClient.get(Endpoints.courseDetail(cid));
        } catch (_) {
          return null;
        }
      }),
    );

    for (var i = 0; i < results.length; i++) {
      final res = results[i];
      if (res == null || !res.success || res.data is! Map) continue;
      final course = res.data['course'];
      if (course is! Map) continue;

      final courseId = (course['id'] ?? courseIds[i]).toString();
      final courseTitle = (course['title'] ?? 'Enrolled Course').toString();
      final fallbackInstructor = (course['instructorName'] ?? 'Faculty').toString();

      final rawRecordings = (course['recordings'] as List<dynamic>?) ?? [];
      for (final raw in rawRecordings) {
        if (raw is! Map) continue;
        final id = (raw['id'] ?? '').toString();
        final url = (raw['recordingUrl'] ?? raw['videoUrl'] ?? '').toString().trim();
        if (url.isEmpty) continue;
        if (id.isNotEmpty && !seenRecIds.add(id)) continue;

        final durSec = (raw['durationSec'] as num?)?.toInt();
        final durMins = (raw['durationMinutes'] as num?)?.toInt() ??
            (durSec != null && durSec > 0 ? (durSec / 60).round() : null);

        hydratedRecordings.add({
          'id': id,
          'title': (raw['title'] ?? 'Lecture Recording').toString(),
          'description': raw['description'],
          'courseId': courseId,
          'courseTitle': courseTitle,
          'instructorName': (raw['instructorName'] ?? fallbackInstructor).toString(),
          'recordingUrl': url,
          'videoUrl': url,
          'meetingPasscode': raw['meetingPasscode'],
          'meetingPlatform': raw['platform'] ?? raw['meetingPlatform'],
          'startsAt': raw['startsAt'],
          'durationMinutes': durMins,
        });
      }

      // Also check course.liveClasses for any upcoming SCHEDULED/LIVE sessions or recordings
      final rawLive = (course['liveClasses'] as List<dynamic>?) ?? [];
      for (final raw in rawLive) {
        if (raw is! Map) continue;
        final id = (raw['id'] ?? '').toString();
        final status = (raw['status'] ?? '').toString().toUpperCase();
        final recUrl = (raw['recordingUrl'] ?? '').toString().trim();

        if ((status == 'SCHEDULED' || status == 'LIVE') && (id.isEmpty || seenLiveIds.add(id))) {
          hydratedLive.add({
            'id': id,
            'title': (raw['title'] ?? 'Live Class').toString(),
            'description': raw['description'],
            'courseId': courseId,
            'courseTitle': courseTitle,
            'instructorName': (raw['instructorName'] ?? fallbackInstructor).toString(),
            'meetingUrl': raw['meetingUrl'],
            'meetingPlatform': raw['platform'] ?? raw['meetingPlatform'],
            'status': status,
            'startsAt': raw['startsAt'],
          });
        } else if (recUrl.isNotEmpty && (id.isEmpty || seenRecIds.add(id))) {
          hydratedRecordings.add({
            'id': id,
            'title': (raw['title'] ?? 'Lecture Recording').toString(),
            'description': raw['description'],
            'courseId': courseId,
            'courseTitle': courseTitle,
            'instructorName': (raw['instructorName'] ?? fallbackInstructor).toString(),
            'recordingUrl': recUrl,
            'videoUrl': recUrl,
            'meetingPasscode': raw['meetingPasscode'],
            'meetingPlatform': raw['platform'] ?? raw['meetingPlatform'],
            'startsAt': raw['startsAt'],
          });
        }
      }
    }

    // Sort recordings newest first (matching Web LMS)
    hydratedRecordings.sort((a, b) {
      final aDate = DateTime.tryParse((a['startsAt'] ?? '').toString());
      final bDate = DateTime.tryParse((b['startsAt'] ?? '').toString());
      if (aDate != null && bDate != null) return bDate.compareTo(aDate);
      return 0;
    });

    if (hydratedRecordings.isNotEmpty || hydratedLive.length != state.liveClasses.length) {
      state = state.copyWith(
        recordings: hydratedRecordings.isNotEmpty ? hydratedRecordings : state.recordings,
        liveClasses: hydratedLive,
      );
    }
  }

  Future<bool> submitAssignment(String assignmentId, String githubUrl) async {
    final res = await ApiClient.post(
      Endpoints.submitAssignment(assignmentId),
      data: {
        'githubUrl': githubUrl,
        'studentNotes': 'Submitted from TechGration Student Mobile App',
      },
    );

    if (res.success) {
      await loadDashboard();
      return true;
    }
    return false;
  }

  Future<bool> toggleLessonProgress(String lessonId, bool isCompleted) async {
    final res = await ApiClient.post(
      Endpoints.updateLessonProgress(lessonId),
      data: {
        'status': isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
      },
    );

    if (res.success) {
      await loadDashboard();
      return true;
    }
    return false;
  }
}

final studentDashboardProvider = NotifierProvider<StudentDashboardNotifier, StudentDashboardState>(
  StudentDashboardNotifier.new,
);
