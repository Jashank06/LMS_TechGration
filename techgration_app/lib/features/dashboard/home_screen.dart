import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/services/haptic_service.dart';
import '../../core/services/storage_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../../shared/widgets/staggered_entrance.dart';
import '../../shared/widgets/course_image.dart';
import '../courses/course_detail_screen.dart';
import 'student_dashboard_controller.dart';

class HomeScreen extends ConsumerStatefulWidget {
  final VoidCallback onOpenDrawer;

  const HomeScreen({
    super.key,
    required this.onOpenDrawer,
  });

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _selectedDayIndex = 2; // Wednesday

  void _openCourseHub(String title, String courseId) {
    HapticService.mediumImpact();
    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => CourseDetailScreen(
          courseId: courseId,
          courseTitle: title,
        ),
        transitionsBuilder: (context, animation, secondaryAnimation, child) => SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 0.15),
            end: Offset.zero,
          ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
          child: FadeTransition(opacity: animation, child: child),
        ),
      ),
    );
  }

  String _getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    } else if (name.isNotEmpty) {
      return name.substring(0, name.length >= 2 ? 2 : 1).toUpperCase();
    }
    return 'NS';
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(studentDashboardProvider);
    final user = dashboardState.user ?? StorageService.getUserData();
    final userName = user?['name'] as String? ?? 'Student';
    final avatarUrl = (user?['profile']?['avatarUrl'] ?? user?['avatarUrl']) as String?;
    final initials = _getInitials(userName);
    final activeCourse = dashboardState.activeCourse;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: RefreshIndicator(
          color: const Color(0xFF00D6D6),
          backgroundColor: Colors.white,
          onRefresh: () => ref.read(studentDashboardProvider.notifier).loadDashboard(),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),

                // 1. Top Header Bar (TechGration Logo, Search, Notifications, Avatar)
                StaggeredEntrance(
                  delay: Duration.zero,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      children: [
                        // TechGration Brand Mark
                        Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F172A),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: const Color(0xFF00D6D6).withValues(alpha: 0.25),
                                  width: 1,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(9),
                                child: Image.asset(
                                  'assets/images/logo.png',
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => const Center(
                                    child: Text(
                                      'TG',
                                      style: TextStyle(
                                        color: Color(0xFF00D6D6),
                                        fontWeight: FontWeight.w900,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'TechGration',
                                  style: AppTypography.titleLarge.copyWith(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 16,
                                    letterSpacing: -0.3,
                                  ),
                                ),
                                const Text(
                                  'Student Workspace',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: AppColors.textSecondary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),

                        const Spacer(),

                        // Notification Icon
                        BouncingButton(
                          scaleDown: 0.9,
                          onTap: () {
                            HapticService.lightTap();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('All class schedules & reminders up to date')),
                            );
                          },
                          child: Stack(
                            children: [
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: AppColors.borderLight),
                                ),
                                child: const Icon(
                                  Icons.notifications_none_rounded,
                                  size: 20,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              Positioned(
                                top: 7,
                                right: 8,
                                child: Container(
                                  width: 7,
                                  height: 7,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFFF59E0B),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),

                        // Student Avatar Button (Opens Profile Drawer)
                        BouncingButton(
                          scaleDown: 0.92,
                          onTap: () {
                            HapticService.selection();
                            widget.onOpenDrawer();
                          },
                          child: Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: const Color(0xFF00D6D6).withValues(alpha: 0.35),
                                    width: 1.5,
                                  ),
                                  gradient: const LinearGradient(
                                    colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                ),
                                child: ClipOval(
                                  child: (avatarUrl != null && avatarUrl.isNotEmpty)
                                      ? Image.network(
                                          avatarUrl,
                                          width: 40,
                                          height: 40,
                                          fit: BoxFit.cover,
                                          errorBuilder: (context, error, stackTrace) => Center(
                                            child: Text(
                                              initials,
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontWeight: FontWeight.w800,
                                                fontSize: 14,
                                              ),
                                            ),
                                          ),
                                        )
                                      : Center(
                                          child: Text(
                                            initials,
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w800,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ),
                                ),
                              ),
                              Positioned(
                                bottom: 0,
                                right: 0,
                                child: Container(
                                  width: 10,
                                  height: 10,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF22C55E),
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 2),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // 2. Search Bar Pill
                StaggeredEntrance(
                  delay: const Duration(milliseconds: 30),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Container(
                      height: 46,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.borderLight),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.02),
                            blurRadius: 10,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          const SizedBox(width: 14),
                          const Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 20),
                          const SizedBox(width: 10),
                          Text(
                            'Search courses, labs & schedule...',
                            style: AppTypography.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // 3. Personalized Greeting Banner (Matching Web LMS Header)
                StaggeredEntrance(
                  delay: const Duration(milliseconds: 60),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(color: AppColors.borderLight),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 14,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              // Avatar circle with green status
                              Stack(
                                children: [
                                  Container(
                                    width: 52,
                                    height: 52,
                                    decoration: const BoxDecoration(
                                      shape: BoxShape.circle,
                                      gradient: LinearGradient(
                                        colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      ),
                                    ),
                                    child: Center(
                                      child: Text(
                                        initials,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w900,
                                          fontSize: 18,
                                        ),
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                    bottom: 1,
                                    right: 1,
                                    child: Container(
                                      width: 13,
                                      height: 13,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF22C55E),
                                        shape: BoxShape.circle,
                                        border: Border.all(color: Colors.white, width: 2),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    RichText(
                                      text: TextSpan(
                                        text: 'Good evening, ',
                                        style: AppTypography.headlineMedium.copyWith(
                                          color: AppColors.textPrimary,
                                          fontWeight: FontWeight.w800,
                                          fontSize: 17,
                                        ),
                                        children: [
                                          TextSpan(
                                            text: userName,
                                            style: const TextStyle(
                                              color: Color(0xFF0284C7),
                                              fontWeight: FontWeight.w900,
                                            ),
                                          ),
                                          const TextSpan(text: ' 👋'),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    const Text(
                                      'Track your enrolled courses, upcoming live classes, and weekly progress.',
                                      style: TextStyle(
                                        color: AppColors.textSecondary,
                                        fontSize: 11,
                                        height: 1.3,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: BouncingButton(
                                  scaleDown: 0.96,
                                  onTap: () => _openCourseHub(
                                    activeCourse['title'] as String,
                                    activeCourse['id'] as String,
                                  ),
                                  child: Container(
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF00D6D6),
                                      borderRadius: BorderRadius.circular(12),
                                      boxShadow: [
                                        BoxShadow(
                                          color: const Color(0xFF00D6D6).withValues(alpha: 0.3),
                                          blurRadius: 8,
                                          offset: const Offset(0, 3),
                                        ),
                                      ],
                                    ),
                                    alignment: Alignment.center,
                                    child: const Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(Icons.play_circle_fill_rounded, color: Colors.white, size: 18),
                                        SizedBox(width: 6),
                                        Text(
                                          'Start Learning',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w800,
                                            fontSize: 13,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: BouncingButton(
                                  scaleDown: 0.96,
                                  onTap: () {
                                    HapticService.lightTap();
                                    _openCourseHub(
                                      activeCourse['title'] as String,
                                      activeCourse['id'] as String,
                                    );
                                  },
                                  child: Container(
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: AppColors.borderLight),
                                    ),
                                    alignment: Alignment.center,
                                    child: const Text(
                                      'My Courses',
                                      style: TextStyle(
                                        color: AppColors.textPrimary,
                                        fontWeight: FontWeight.w700,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 22),

                // 4. The 6 Real LMS Metric Cards Row
                StaggeredEntrance(
                  delay: const Duration(milliseconds: 90),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Text(
                          'Learning Overview 📊',
                          style: AppTypography.headlineMedium.copyWith(
                            fontWeight: FontWeight.w800,
                            fontSize: 18,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Row(
                          children: [
                            _buildMetricCard(
                              title: 'Courses',
                              value: '${dashboardState.enrolledCoursesCount}',
                              icon: Icons.menu_book_rounded,
                              iconColor: const Color(0xFF0284C7),
                              iconBg: const Color(0xFFE0F2FE),
                            ),
                            const SizedBox(width: 12),
                            _buildMetricCard(
                              title: 'Completion',
                              value: '${dashboardState.avgProgress}%',
                              icon: Icons.trending_up_rounded,
                              iconColor: const Color(0xFF10B981),
                              iconBg: const Color(0xFFD1FAE5),
                            ),
                            const SizedBox(width: 12),
                            _buildMetricCard(
                              title: 'Lessons',
                              value: '${dashboardState.completedLessonsCount}',
                              icon: Icons.check_circle_outline_rounded,
                              iconColor: const Color(0xFF00D6D6),
                              iconBg: const Color(0xFFE6FFFA),
                            ),
                            const SizedBox(width: 12),
                            _buildMetricCard(
                              title: 'Study Time',
                              value: dashboardState.hoursInvested,
                              icon: Icons.schedule_rounded,
                              iconColor: const Color(0xFFF59E0B),
                              iconBg: const Color(0xFFFEF3C7),
                            ),
                            const SizedBox(width: 12),
                            _buildMetricCard(
                              title: 'Quizzes',
                              value: '${dashboardState.passedQuizzesCount}',
                              icon: Icons.auto_awesome_rounded,
                              iconColor: const Color(0xFF8B5CF6),
                              iconBg: const Color(0xFFEDE9FE),
                            ),
                            const SizedBox(width: 12),
                            _buildMetricCard(
                              title: 'Certificates',
                              value: '${dashboardState.certificatesCount}',
                              icon: Icons.workspace_premium_rounded,
                              iconColor: const Color(0xFF06B6D4),
                              iconBg: const Color(0xFFCFFAFE),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // 5. CONTINUE LEARNING (Matching Web LMS Card for "Machine Learning")
                StaggeredEntrance(
                  delay: const Duration(milliseconds: 120),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.play_circle_outline_rounded, size: 18, color: Color(0xFF00D6D6)),
                                const SizedBox(width: 6),
                                Text(
                                  'CONTINUE LEARNING',
                                  style: AppTypography.titleLarge.copyWith(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 14,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                            BouncingButton(
                              onTap: () {
                                HapticService.selection();
                                _openCourseHub(activeCourse['title'] as String, activeCourse['id'] as String);
                              },
                              child: const Text(
                                'My Courses →',
                                style: TextStyle(
                                  color: Color(0xFF0284C7),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Active Course Card
                        Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(22),
                            border: Border.all(color: AppColors.borderLight),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.03),
                                blurRadius: 14,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          padding: const EdgeInsets.all(18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  // Course Image Poster Thumbnail
                                  CourseImage(
                                    width: 80,
                                    height: 80,
                                    imageUrl: activeCourse['thumbnailUrl'] as String?,
                                    courseTitle: activeCourse['title'] as String? ?? 'Artificial Intelligence',
                                    borderRadius: BorderRadius.circular(16),
                                    fit: BoxFit.cover,
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          (activeCourse['category'] as String? ?? 'AI & MACHINE LEARNING').toUpperCase(),
                                          style: const TextStyle(
                                            color: Color(0xFF008A8A),
                                            fontWeight: FontWeight.w800,
                                            fontSize: 10,
                                            letterSpacing: 0.6,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          activeCourse['title'] as String? ?? 'Machine Learning',
                                          style: AppTypography.headlineMedium.copyWith(
                                            fontWeight: FontWeight.w900,
                                            fontSize: 17,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        const Text(
                                          'Ready to begin your study journey',
                                          style: TextStyle(
                                            color: AppColors.textSecondary,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Progress',
                                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                                  ),
                                  Text(
                                    '${((activeCourse['progressPct'] as num?)?.toDouble() ?? 0.0).toInt()}%',
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFF008A8A),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(6),
                                child: LinearProgressIndicator(
                                  value: (((activeCourse['progressPct'] as num?)?.toDouble() ?? 0.0) / 100.0).clamp(0.0, 1.0),
                                  minHeight: 6,
                                  backgroundColor: AppColors.surfaceLight,
                                  valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF00D6D6)),
                                ),
                              ),
                              const SizedBox(height: 16),
                              BouncingButton(
                                scaleDown: 0.97,
                                onTap: () => _openCourseHub(
                                  activeCourse['title'] as String,
                                  activeCourse['id'] as String,
                                ),
                                child: Container(
                                  width: double.infinity,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                                    ),
                                    borderRadius: BorderRadius.circular(12),
                                    boxShadow: [
                                      BoxShadow(
                                        color: const Color(0xFF00D6D6).withValues(alpha: 0.3),
                                        blurRadius: 10,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  alignment: Alignment.center,
                                  child: const Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.play_arrow_rounded, color: Colors.white, size: 20),
                                      SizedBox(width: 6),
                                      Text(
                                        'Start Learning',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w800,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // 6. WEEKLY STUDY TIME 7-Day Chart (Matching Web LMS)
                StaggeredEntrance(
                  delay: const Duration(milliseconds: 150),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(color: AppColors.borderLight),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 14,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.schedule_rounded, size: 18, color: Color(0xFF0284C7)),
                                  const SizedBox(width: 6),
                                  Text(
                                    'WEEKLY STUDY TIME',
                                    style: AppTypography.titleLarge.copyWith(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 14,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFE0F2FE),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  '0.0 hrs total',
                                  style: TextStyle(
                                    color: Color(0xFF0369A1),
                                    fontWeight: FontWeight.w800,
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Time spent learning over the last 7 days.',
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                          ),
                          const SizedBox(height: 20),

                          // 7-day Bar chart with tooltips
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: List.generate(dashboardState.past7DaysData.length, (idx) {
                              final dayData = dashboardState.past7DaysData[idx];
                              final isSelected = idx == _selectedDayIndex;
                              final minutes = (dayData['minutes'] as num?)?.toInt() ?? 0;
                              final height = minutes > 0 ? (minutes / 60.0 * 80).clamp(16.0, 90.0) : 10.0;

                              return InkWell(
                                onTap: () {
                                  HapticService.selection();
                                  setState(() => _selectedDayIndex = idx);
                                },
                                borderRadius: BorderRadius.circular(10),
                                child: Column(
                                  children: [
                                    if (isSelected)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF0F172A),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          '${minutes}m',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 9,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      )
                                    else
                                      const SizedBox(height: 16),
                                    const SizedBox(height: 4),
                                    Container(
                                      width: 28,
                                      height: height,
                                      decoration: BoxDecoration(
                                        color: isSelected ? const Color(0xFF00D6D6) : const Color(0xFFE2E8F0),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      dayData['day'] as String? ?? 'Day',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                        color: isSelected ? AppColors.textPrimary : AppColors.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                          ),

                          const SizedBox(height: 16),
                          const Divider(height: 1, color: AppColors.divider),
                          const SizedBox(height: 12),
                          const Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Daily target: 45 mins', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                              Text('Goal reached 0/7 days', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // 7. UPCOMING LIVE MASTERCLASSES
                if (dashboardState.liveClasses.isNotEmpty) ...[
                  StaggeredEntrance(
                    delay: const Duration(milliseconds: 180),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Upcoming Live Classes 🎥',
                            style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800, fontSize: 18),
                          ),
                          const SizedBox(height: 12),
                          for (final lc in dashboardState.liveClasses) ...[
                            _buildLiveClassCard(context, lc as Map<String, dynamic>),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                const SizedBox(height: 80),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    String? subtitle,
    required IconData icon,
    required Color iconColor,
    required Color iconBg,
  }) {
    return Container(
      width: 140,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: 4),
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: iconColor, size: 15),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary,
              letterSpacing: -0.5,
            ),
          ),
          if (subtitle != null && subtitle.isNotEmpty) ...[
            const SizedBox(height: 2),
            Text(
              subtitle,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildLiveClassCard(BuildContext context, Map<String, dynamic> lc) {
    final title = lc['title'] as String? ?? 'Live Masterclass';
    final instructor = lc['instructor']?['name'] as String? ?? 'Faculty';
    final meetingUrl = lc['meetingUrl'] as String? ?? '';
    final isLive = lc['status'] == 'LIVE';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isLive ? const Color(0xFFEF4444) : AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: isLive ? const Color(0xFFFEE2E2) : const Color(0xFFE0F2FE),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.videocam_rounded,
              color: isLive ? const Color(0xFFEF4444) : const Color(0xFF0284C7),
              size: 22,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                ),
                Text(
                  'Instructor: $instructor',
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          BouncingButton(
            scaleDown: 0.94,
            onTap: () async {
              if (meetingUrl.isNotEmpty) {
                final uri = Uri.parse(meetingUrl);
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                }
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
              decoration: BoxDecoration(
                color: isLive ? const Color(0xFFEF4444) : const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                isLive ? 'Join Now' : 'Join',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
