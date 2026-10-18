import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';
import '../../core/network/endpoints.dart';

class AcademicsState {
  final bool isLoading;
  final String? error;

  // Assessments
  final List<dynamic> assessments;

  // Leaderboard
  final List<dynamic> leaderboardCourses;
  final Map<String, dynamic>? activeLeaderboardCourse;
  final List<dynamic> rankedStudents;
  final List<dynamic> waitingStudents;
  final Map<String, dynamic>? leaderboardStats;
  final String? selectedCourseId;

  // Certificates
  final List<dynamic> certificates;
  final List<dynamic> inProgressCourses;

  // Rewards & Milestones
  final Map<String, dynamic>? rewardEligibility;
  final List<dynamic> rewardClaims;
  final List<dynamic> rewardCatalog;
  final List<dynamic> milestones;

  const AcademicsState({
    this.isLoading = false,
    this.error,
    this.assessments = const [],
    this.leaderboardCourses = const [],
    this.activeLeaderboardCourse,
    this.rankedStudents = const [],
    this.waitingStudents = const [],
    this.leaderboardStats,
    this.selectedCourseId,
    this.certificates = const [],
    this.inProgressCourses = const [],
    this.rewardEligibility,
    this.rewardClaims = const [],
    this.rewardCatalog = const [],
    this.milestones = const [],
  });

  AcademicsState copyWith({
    bool? isLoading,
    String? error,
    List<dynamic>? assessments,
    List<dynamic>? leaderboardCourses,
    Map<String, dynamic>? activeLeaderboardCourse,
    List<dynamic>? rankedStudents,
    List<dynamic>? waitingStudents,
    Map<String, dynamic>? leaderboardStats,
    String? selectedCourseId,
    List<dynamic>? certificates,
    List<dynamic>? inProgressCourses,
    Map<String, dynamic>? rewardEligibility,
    List<dynamic>? rewardClaims,
    List<dynamic>? rewardCatalog,
    List<dynamic>? milestones,
  }) {
    return AcademicsState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      assessments: assessments ?? this.assessments,
      leaderboardCourses: leaderboardCourses ?? this.leaderboardCourses,
      activeLeaderboardCourse: activeLeaderboardCourse ?? this.activeLeaderboardCourse,
      rankedStudents: rankedStudents ?? this.rankedStudents,
      waitingStudents: waitingStudents ?? this.waitingStudents,
      leaderboardStats: leaderboardStats ?? this.leaderboardStats,
      selectedCourseId: selectedCourseId ?? this.selectedCourseId,
      certificates: certificates ?? this.certificates,
      inProgressCourses: inProgressCourses ?? this.inProgressCourses,
      rewardEligibility: rewardEligibility ?? this.rewardEligibility,
      rewardClaims: rewardClaims ?? this.rewardClaims,
      rewardCatalog: rewardCatalog ?? this.rewardCatalog,
      milestones: milestones ?? this.milestones,
    );
  }
}

class AcademicsNotifier extends Notifier<AcademicsState> {
  @override
  AcademicsState build() {
    Future.microtask(() => loadAll());
    return const AcademicsState(isLoading: true);
  }

  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, error: null);

    final results = await Future.wait([
      ApiClient.get(Endpoints.assessments),
      ApiClient.get(Endpoints.leaderboard(courseId: state.selectedCourseId)),
      ApiClient.get(Endpoints.certificates),
      ApiClient.get(Endpoints.rewards),
    ]);

    final assessmentsRes = results[0];
    final leaderboardRes = results[1];
    final certificatesRes = results[2];
    final rewardsRes = results[3];

    List<dynamic> assessments = state.assessments;
    if (assessmentsRes.success && assessmentsRes.data is Map) {
      assessments = (assessmentsRes.data['assessments'] as List<dynamic>?) ?? [];
    }

    List<dynamic> leaderboardCourses = state.leaderboardCourses;
    Map<String, dynamic>? activeLeaderboardCourse = state.activeLeaderboardCourse;
    List<dynamic> rankedStudents = state.rankedStudents;
    List<dynamic> waitingStudents = state.waitingStudents;
    Map<String, dynamic>? leaderboardStats = state.leaderboardStats;

    if (leaderboardRes.success && leaderboardRes.data is Map) {
      final lData = leaderboardRes.data as Map<String, dynamic>;
      leaderboardCourses = (lData['courses'] as List<dynamic>?) ?? [];
      activeLeaderboardCourse = lData['activeCourse'] as Map<String, dynamic>?;
      rankedStudents = (lData['ranked'] as List<dynamic>?) ?? [];
      waitingStudents = (lData['waiting'] as List<dynamic>?) ?? [];
      leaderboardStats = lData['stats'] as Map<String, dynamic>?;
    }

    List<dynamic> certificates = state.certificates;
    List<dynamic> inProgressCourses = state.inProgressCourses;
    if (certificatesRes.success && certificatesRes.data is Map) {
      final cData = certificatesRes.data as Map<String, dynamic>;
      certificates = (cData['certificates'] as List<dynamic>?) ?? [];
      inProgressCourses = (cData['inProgressCourses'] as List<dynamic>?) ?? [];
    }

    Map<String, dynamic>? rewardEligibility = state.rewardEligibility;
    List<dynamic> rewardClaims = state.rewardClaims;
    List<dynamic> rewardCatalog = state.rewardCatalog;
    List<dynamic> milestones = state.milestones;
    if (rewardsRes.success && rewardsRes.data is Map) {
      final rData = rewardsRes.data as Map<String, dynamic>;
      rewardEligibility = rData['eligibility'] as Map<String, dynamic>?;
      rewardClaims = (rData['claims'] as List<dynamic>?) ?? [];
      rewardCatalog = (rData['catalog'] as List<dynamic>?) ?? [];
      milestones = (rData['milestones'] as List<dynamic>?) ?? [];
    }

    state = state.copyWith(
      isLoading: false,
      assessments: assessments,
      leaderboardCourses: leaderboardCourses,
      activeLeaderboardCourse: activeLeaderboardCourse,
      rankedStudents: rankedStudents,
      waitingStudents: waitingStudents,
      leaderboardStats: leaderboardStats,
      certificates: certificates,
      inProgressCourses: inProgressCourses,
      rewardEligibility: rewardEligibility,
      rewardClaims: rewardClaims,
      rewardCatalog: rewardCatalog,
      milestones: milestones,
    );
  }

  Future<void> selectLeaderboardCourse(String courseId) async {
    state = state.copyWith(selectedCourseId: courseId, isLoading: true);
    final res = await ApiClient.get(Endpoints.leaderboard(courseId: courseId));
    if (res.success && res.data is Map) {
      final lData = res.data as Map<String, dynamic>;
      state = state.copyWith(
        isLoading: false,
        activeLeaderboardCourse: lData['activeCourse'] as Map<String, dynamic>?,
        rankedStudents: (lData['ranked'] as List<dynamic>?) ?? [],
        waitingStudents: (lData['waiting'] as List<dynamic>?) ?? [],
        leaderboardStats: lData['stats'] as Map<String, dynamic>?,
      );
    } else {
      state = state.copyWith(isLoading: false);
    }
  }
}

final academicsProvider = NotifierProvider<AcademicsNotifier, AcademicsState>(
  AcademicsNotifier.new,
);
