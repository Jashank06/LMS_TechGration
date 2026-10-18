import 'package:flutter_riverpod/legacy.dart';

/// Provider to switch main bottom navigation shell tabs from anywhere (e.g. Profile Drawer):
/// 0: Dashboard (Home)
/// 1: Courses (My Courses)
/// 2: Live Classes
/// 3: Assignments
/// 4: Academics Center
final selectedNavIndexProvider = StateProvider<int>((ref) => 0);

/// Provider to switch active sub-tab inside Academics Center (RewardsScreen):
/// 0: Assessments & Quizzes
/// 1: Leaderboard
/// 2: Certificates
/// 3: Milestones
final selectedAcademicsTabProvider = StateProvider<int>((ref) => 0);
