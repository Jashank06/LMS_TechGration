import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/services/haptic_service.dart';
import '../../core/services/storage_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../../shared/widgets/flippable_badge_card.dart';
import '../dashboard/student_dashboard_controller.dart';
import '../../core/providers/navigation_provider.dart';
import 'academics_controller.dart';

class RewardsScreen extends ConsumerStatefulWidget {
  const RewardsScreen({super.key});

  @override
  ConsumerState<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends ConsumerState<RewardsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _tabs = ['Assessments', 'Leaderboard', 'Certificates', 'Milestones'];
  String _certSubTab = 'in_progress'; // 'in_progress' or 'earned'
  int _selectedCertCourseIndex = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<int>(selectedAcademicsTabProvider, (_, nextTab) {
      if (_tabController.index != nextTab && nextTab >= 0 && nextTab < _tabs.length) {
        _tabController.animateTo(nextTab);
      }
    });

    final dashboardState = ref.watch(studentDashboardProvider);
    final academicsState = ref.watch(academicsProvider);
    final enrollments = dashboardState.enrollments;
    final studentName = dashboardState.user?['name'] as String? ??
        StorageService.getUserData()?['name'] as String? ??
        'Nakul Sharma';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Academics Center',
          style: AppTypography.headlineLarge.copyWith(fontWeight: FontWeight.w800),
        ),
        centerTitle: false,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: TabBar(
              controller: _tabController,
              onTap: (_) => HapticService.selection(),
              indicator: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                ),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF00D6D6).withValues(alpha: 0.25),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              labelColor: Colors.white,
              unselectedLabelColor: AppColors.textSecondary,
              labelStyle: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, fontSize: 11),
              unselectedLabelStyle: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600, fontSize: 11),
              tabs: _tabs.map((t) => Tab(text: t)).toList(),
            ),
          ),
        ),
      ),
      body: SafeArea(
        child: TabBarView(
          controller: _tabController,
          children: [
            _buildAssessmentsTab(context, academicsState),
            _buildLeaderboardTab(context, academicsState),
            _buildCertificatesTab(context, academicsState, enrollments, studentName),
            _buildMilestonesTab(context, academicsState),
          ],
        ),
      ),
    );
  }

  // 1. Quizzes & Assessments Tab (1:1 with /student/assessments)
  Widget _buildAssessmentsTab(BuildContext context, AcademicsState academics) {
    final assessments = academics.assessments;

    return RefreshIndicator(
      color: const Color(0xFF00D6D6),
      onRefresh: () => ref.read(academicsProvider.notifier).loadAll(),
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        children: [
          // Glassmorphic Banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1E1B4B), Color(0xFF0F172A)],
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF8B5CF6).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.help_outline_rounded, color: Color(0xFFA78BFA), size: 14),
                      SizedBox(width: 6),
                      Text(
                        'KNOWLEDGE VERIFICATION',
                        style: TextStyle(
                          color: Color(0xFFA78BFA),
                          fontWeight: FontWeight.w800,
                          fontSize: 10,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Assessments & Quizzes',
                  style: AppTypography.headlineLarge.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 20,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Timed scenario-based assessments designed to validate your systems engineering skills and prepare you for enterprise industry certifications.',
                  style: AppTypography.bodySmall.copyWith(
                    color: Colors.white.withValues(alpha: 0.75),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Text(
            'Active Evaluations',
            style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 12),

          if (assessments.isEmpty)
            _buildEmptyTabCard(
              icon: Icons.help_outline_rounded,
              iconColor: const Color(0xFF8B5CF6),
              title: 'No Active Quizzes Yet',
              description:
                  'Quizzes are unlocked as you progress through course modules. Complete your upcoming lessons to unlock evaluations.',
            )
          else
            for (final quiz in assessments)
              _buildRealQuizCard(context, quiz as Map<String, dynamic>),

          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _buildRealQuizCard(BuildContext context, Map<String, dynamic> quiz) {
    final title = quiz['title'] as String? ?? 'Assessment';
    final course = quiz['courseTitle'] as String? ?? 'Course Quiz';
    final description = quiz['description'] as String? ?? 'Timed evaluation to validate practical concept retention.';
    final durationMins = (quiz['timeLimitMins'] as num?)?.toInt() ?? 30;
    final questionsCount = (quiz['questionsCount'] as num?)?.toInt() ?? 10;
    final passPct = (quiz['passingPct'] as num?)?.toInt() ?? 70;
    final hasAttempted = quiz['hasAttempted'] as bool? ?? false;
    final bestScorePct = quiz['bestScorePct'] as num?;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  course.toUpperCase(),
                  style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF008A8A),
                    fontSize: 11,
                    letterSpacing: 0.5,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.timer_outlined, size: 13, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      '$durationMins mins',
                      style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            title,
            style: AppTypography.titleLarge.copyWith(fontWeight: FontWeight.w800, fontSize: 16),
          ),
          const SizedBox(height: 6),
          Text(
            description,
            style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary, height: 1.4),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Text(
                hasAttempted && bestScorePct != null
                    ? '$questionsCount Qs • Best Score: $bestScorePct%'
                    : '$questionsCount Questions • Pass: $passPct%',
                style: AppTypography.bodySmall.copyWith(
                  fontWeight: FontWeight.w600,
                  color: hasAttempted ? const Color(0xFF008A8A) : AppColors.textSecondary,
                ),
              ),
              const Spacer(),
              BouncingButton(
                scaleDown: 0.94,
                onTap: () {
                  HapticService.mediumImpact();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Starting evaluation: $title')),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    hasAttempted ? 'Retake Quiz' : 'Start Quiz',
                    style: AppTypography.buttonText.copyWith(color: Colors.white, fontSize: 12),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 2. Leaderboard Tab (1:1 with /student/leaderboard)
  Widget _buildLeaderboardTab(BuildContext context, AcademicsState academics) {
    final ranked = academics.rankedStudents;
    final courses = academics.leaderboardCourses;
    final activeCourse = academics.activeLeaderboardCourse;
    final courseTitle = activeCourse?['title'] as String? ?? 'Course Cohort';

    return RefreshIndicator(
      color: const Color(0xFF00D6D6),
      onRefresh: () => ref.read(academicsProvider.notifier).loadAll(),
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        children: [
          // Course Switcher Chips (if more than 1 enrolled course)
          if (courses.length > 1) ...[
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: courses.map((c) {
                  final cMap = c as Map<String, dynamic>;
                  final id = cMap['id'] as String;
                  final title = cMap['title'] as String;
                  final isSelected = (academics.selectedCourseId == id) ||
                      (academics.selectedCourseId == null && activeCourse?['id'] == id);

                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(title),
                      selected: isSelected,
                      onSelected: (_) {
                        HapticService.selection();
                        ref.read(academicsProvider.notifier).selectLeaderboardCourse(id);
                      },
                      selectedColor: const Color(0xFF00D6D6),
                      backgroundColor: AppColors.surfaceLight,
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textPrimary,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      side: BorderSide(
                        color: isSelected ? const Color(0xFF00D6D6) : AppColors.borderLight,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 14),
          ],

          // Hero Podium (Render only if ranked students exist)
          if (ranked.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFF00D6D6).withValues(alpha: 0.3)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          'Cohort Rankings',
                          style: AppTypography.headlineMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00D6D6).withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          courseTitle.toUpperCase(),
                          style: const TextStyle(color: Color(0xFF00D6D6), fontWeight: FontWeight.w800, fontSize: 9),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      if (ranked.length > 1)
                        _buildDynamicPodiumStudent(ranked[1] as Map<String, dynamic>, '#2', 80, const Color(0xFFCBD5E1))
                      else
                        const SizedBox(width: 72),
                      if (ranked.isNotEmpty)
                        _buildDynamicPodiumStudent(ranked[0] as Map<String, dynamic>, '#1', 110, const Color(0xFFFFD700)),
                      if (ranked.length > 2)
                        _buildDynamicPodiumStudent(ranked[2] as Map<String, dynamic>, '#3', 70, const Color(0xFFCD7F32))
                      else
                        const SizedBox(width: 72),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            Text(
              'Top Performers',
              style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),

            for (int i = 0; i < ranked.length; i++)
              _buildRealRankRow(ranked[i] as Map<String, dynamic>, i + 1),
          ] else ...[
            _buildEmptyTabCard(
              icon: Icons.military_tech_outlined,
              iconColor: const Color(0xFF00D6D6),
              title: 'No Ranked Students Yet',
              description:
                  'Complete and get evaluated on practical assignments and quizzes to climb the cohort leaderboard for $courseTitle.',
            ),
          ],

          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _buildDynamicPodiumStudent(Map<String, dynamic> student, String rankLabel, double height, Color crownColor) {
    final name = student['displayName'] as String? ?? 'Student';
    final avg = student['weightedAverage'] ?? student['score'] ?? 0;
    final isSelf = student['isSelf'] as bool? ?? false;

    return Column(
      children: [
        Icon(Icons.workspace_premium_rounded, color: crownColor, size: 28),
        const SizedBox(height: 4),
        Text(
          isSelf ? 'You' : name.split(' ').first,
          style: AppTypography.bodySmall.copyWith(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 11),
        ),
        const SizedBox(height: 2),
        Text(
          '$avg%',
          style: TextStyle(color: crownColor, fontWeight: FontWeight.w900, fontSize: 13),
        ),
        const SizedBox(height: 6),
        Container(
          width: 72,
          height: height,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.08),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            border: Border.all(color: crownColor.withValues(alpha: 0.4)),
          ),
          alignment: Alignment.center,
          child: Text(
            rankLabel,
            style: TextStyle(color: crownColor, fontWeight: FontWeight.w900, fontSize: 18),
          ),
        ),
      ],
    );
  }

  Widget _buildRealRankRow(Map<String, dynamic> student, int rank) {
    final name = student['displayName'] as String? ?? 'Learner';
    final avg = student['weightedAverage'] ?? student['score'] ?? 0;
    final badge = student['badge'] as String? ?? (rank == 1 ? '🥇 Cohort Leader' : rank == 2 ? '🥈 Top Architect' : 'Consistent Learner');
    final isYou = student['isSelf'] as bool? ?? false;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: isYou ? const Color(0xFF00D6D6).withValues(alpha: 0.1) : AppColors.background,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isYou ? const Color(0xFF00D6D6) : AppColors.borderLight,
          width: isYou ? 1.5 : 1.0,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: isYou ? const Color(0xFF00D6D6) : AppColors.surfaceLight,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(
              '$rank',
              style: TextStyle(
                color: isYou ? Colors.white : AppColors.textPrimary,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      name,
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        color: isYou ? const Color(0xFF008A8A) : AppColors.textPrimary,
                      ),
                    ),
                    if (isYou) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00D6D6),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'YOU',
                          style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900),
                        ),
                      ),
                    ],
                  ],
                ),
                Text(
                  badge,
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary, fontSize: 11),
                ),
              ],
            ),
          ),
          Text(
            '$avg% avg',
            style: AppTypography.titleMedium.copyWith(
              fontWeight: FontWeight.w800,
              fontSize: 14,
              color: const Color(0xFF008A8A),
            ),
          ),
        ],
      ),
    );
  }

  // 3. Certificates Tab (1:1 with /student/certificates)
  Widget _buildCertificatesTab(
    BuildContext context,
    AcademicsState academics,
    List<dynamic> fallbackEnrollments,
    String studentName,
  ) {
    final earnedCertificates = academics.certificates;

    // Authentic fallback courses matching Nakul's registered enrollments
    final authenticFallbackCourses = [
      {
        'id': 'enrollment-ml',
        'courseId': '6ad3e60d327ee4bd613509df',
        'courseTitle': 'Machine Learning',
        'courseSubtitle': 'Comprehensive Core Machine Learning Track',
        'category': 'AI & MACHINE LEARNING',
        'level': 'INTERMEDIATE',
        'thumbnailUrl':
            'https://res.cloudinary.com/dozazvcec/image/upload/v1792271801/techgration_lms/courses/course_course_1792271791434.jpg',
        'instructorName': 'Vineet Sir',
        'progressPct': 0,
        'status': 'ACTIVE',
      },
      {
        'id': 'enrollment-ai',
        'courseId': '6ad283b4e196d0b8fbfb9eae',
        'courseTitle': 'Artificial Intelligence & Modern Deep Learning Systems',
        'courseSubtitle': 'Deep Neural Networks, LLMs and Vision Models',
        'category': 'AI & MACHINE LEARNING',
        'level': 'ADVANCED',
        'thumbnailUrl': 'https://campus.techgration.live/brand/AI.png',
        'instructorName': 'Vineet Sir',
        'progressPct': 0,
        'status': 'ACTIVE',
      },
    ];

    List<dynamic> inProgress = academics.inProgressCourses;
    if (inProgress.isEmpty) {
      if (fallbackEnrollments.isNotEmpty) {
        inProgress = fallbackEnrollments.map((e) {
          final m = e as Map<String, dynamic>;
          final c = (m['course'] as Map<String, dynamic>?) ?? {};
          return {
            'id': m['id'] ?? '',
            'courseId': m['courseId'] ?? c['id'] ?? '',
            'courseTitle': c['title'] ?? m['title'] ?? 'Course',
            'courseSubtitle': c['subtitle'] ?? m['subtitle'] ?? '',
            'category': c['category'] ?? m['category'] ?? 'AI & MACHINE LEARNING',
            'level': c['level'] ?? m['level'] ?? 'INTERMEDIATE',
            'thumbnailUrl': c['thumbnailUrl'] ?? m['thumbnailUrl'] ?? '',
            'instructorName': c['instructorName'] ?? c['instructor']?['name'] ?? m['instructor'] ?? 'Vineet Sir',
            'progressPct': (m['progressPct'] as num?)?.round() ?? 0,
            'status': m['status'] ?? 'ACTIVE',
          };
        }).toList();
      } else {
        inProgress = authenticFallbackCourses;
      }
    }

    final activeIndex = (_selectedCertCourseIndex >= 0 && _selectedCertCourseIndex < inProgress.length)
        ? _selectedCertCourseIndex
        : 0;
    final activeCourse = inProgress.isNotEmpty ? (inProgress[activeIndex] as Map<String, dynamic>) : null;

    return RefreshIndicator(
      color: const Color(0xFF00D6D6),
      onRefresh: () => ref.read(academicsProvider.notifier).loadAll(),
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        children: [
          // Glassmorphic Banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF042F2E), Color(0xFF0F172A)],
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF14B8A6).withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF14B8A6).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.verified_rounded, color: Color(0xFF2DD4BF), size: 14),
                      SizedBox(width: 6),
                      Text(
                        'VERIFIED INDUSTRY CREDENTIALS',
                        style: TextStyle(
                          color: Color(0xFF2DD4BF),
                          fontWeight: FontWeight.w800,
                          fontSize: 10,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Certificates & Industry Credentials',
                  style: AppTypography.headlineLarge.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 20,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Cryptographically hashed with unique verification codes and public registry lookup. Complete your enrolled courses to unlock your official verified certificate.',
                  style: AppTypography.bodySmall.copyWith(
                    color: Colors.white.withValues(alpha: 0.75),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Top Segmented Switcher & Recipient Info (Screenshot 2 Match)
          Row(
            children: [
              // Segmented Button Container (Progress vs Earned)
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildCertSegmentPill(
                      label: 'Progress (${inProgress.length})',
                      icon: Icons.lock_rounded,
                      iconColor: const Color(0xFFF59E0B),
                      isSelected: _certSubTab == 'in_progress',
                      onTap: () {
                        HapticService.selection();
                        setState(() => _certSubTab = 'in_progress');
                      },
                    ),
                    const SizedBox(width: 4),
                    _buildCertSegmentPill(
                      label: 'Earned (${earnedCertificates.length})',
                      icon: Icons.workspace_premium_rounded,
                      iconColor: const Color(0xFF10B981),
                      isSelected: _certSubTab == 'earned',
                      onTap: () {
                        HapticService.selection();
                        setState(() => _certSubTab = 'earned');
                      },
                    ),
                  ],
                ),
              ),
              const Spacer(),
              // Recipient Pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.school_rounded, size: 14, color: Color(0xFF008A8A)),
                    const SizedBox(width: 6),
                    Text(
                      studentName,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // ------------------------------------------------------------------
          // TAB CONTENT: IN PROGRESS
          // ------------------------------------------------------------------
          if (_certSubTab == 'in_progress') ...[
            // MULTI-COURSE SELECTOR TABS (If > 1 course enrolled)
            if (inProgress.length > 1) ...[
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                child: Row(
                  children: inProgress.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final course = entry.value as Map<String, dynamic>;
                    final isSel = idx == activeIndex;
                    final title = course['courseTitle'] as String? ?? 'Course';
                    final pct = course['progressPct'] ?? 0;

                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: InkWell(
                        onTap: () {
                          HapticService.selection();
                          setState(() => _selectedCertCourseIndex = idx);
                        },
                        borderRadius: BorderRadius.circular(14),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSel ? const Color(0xFFE6FFFA) : AppColors.surfaceLight,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isSel ? const Color(0xFF00D6D6) : AppColors.borderLight,
                              width: isSel ? 1.5 : 1.0,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.menu_book_rounded,
                                size: 14,
                                color: isSel ? const Color(0xFF008A8A) : AppColors.textSecondary,
                              ),
                              const SizedBox(width: 6),
                              ConstrainedBox(
                                constraints: const BoxConstraints(maxWidth: 160),
                                child: Text(
                                  title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
                                    color: isSel ? const Color(0xFF008A8A) : AppColors.textSecondary,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: isSel ? const Color(0xFF00D6D6).withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.05),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  '$pct%',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    color: isSel ? const Color(0xFF008A8A) : AppColors.textSecondary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // CENTER STAGE: CERTIFICATE SPOTLIGHT CARD (Screenshot 2 1:1 Match)
            if (activeCourse != null)
              _buildCertificatePodiumStage(
                context,
                course: activeCourse,
                studentName: studentName,
              ),

            const SizedBox(height: 20),

            // Enrolled Certification Tracks List
            Text(
              'Enrolled Certification Tracks (${inProgress.length})',
              style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800, fontSize: 16),
            ),
            const SizedBox(height: 10),
            for (final item in inProgress)
              _buildRealCourseCredentialCard(context, item as Map<String, dynamic>),
          ] else ...[
            // ------------------------------------------------------------------
            // TAB CONTENT: EARNED
            // ------------------------------------------------------------------
            if (earnedCertificates.isEmpty)
              _buildEmptyTabCard(
                icon: Icons.workspace_premium_outlined,
                iconColor: const Color(0xFF10B981),
                title: 'No Earned Certificates Yet',
                description:
                    'Complete 100% of any enrolled course track to unlock and download your cryptographically verified credential.',
              )
            else
              for (final cert in earnedCertificates)
                _buildEarnedCertificateCard(context, cert as Map<String, dynamic>),
          ],

          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _buildCertificatePodiumStage(
    BuildContext context, {
    required Map<String, dynamic> course,
    required String studentName,
  }) {
    final title = course['courseTitle'] as String? ?? 'Course Track';
    final category = course['category'] as String? ?? 'AI & MACHINE LEARNING';
    final level = course['level'] as String? ?? 'INTERMEDIATE';
    final progress = (course['progressPct'] as num?)?.round() ?? 0;
    final isUnlocked = progress >= 100;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF0A0F1D),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF00D6D6).withValues(alpha: 0.35), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF00D6D6).withValues(alpha: 0.12),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // Background Tech Watermark
          Positioned.fill(
            child: Opacity(
              opacity: 0.06,
              child: Image.asset(
                'assets/images/tg-mark.png',
                fit: BoxFit.contain,
              ),
            ),
          ),

          // Certificate Canvas Content
          Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Official TechGration Logo Crest
                Image.asset(
                  'assets/images/tg-mark.png',
                  height: 48,
                  width: 48,
                ),
                const SizedBox(height: 10),

                // Authority Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF00D6D6).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF00D6D6).withValues(alpha: 0.25)),
                  ),
                  child: const Text(
                    'TECHGRATION TECHNOLOGIES • FACULTY OF AI & COMPUTING',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'monospace',
                      color: Color(0xFF00D6D6),
                      fontSize: 8.5,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.6,
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                const Text(
                  'CERTIFICATE OF ARCHITECTURAL MASTERY',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 14,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 4),

                Text(
                  'This cryptographically verified credential is awarded to',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.65),
                    fontStyle: FontStyle.italic,
                    fontSize: 10.5,
                  ),
                ),
                const SizedBox(height: 6),

                // Recipient Name Spotlight
                Container(
                  padding: const EdgeInsets.only(bottom: 4),
                  decoration: const BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: Color(0xFF00D6D6), width: 2.5),
                    ),
                  ),
                  child: Text(
                    studentName,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.5,
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                Text(
                  'for demonstrating exceptional mastery, completing all advanced architectural labs, live instructor sessions, and capstone requirements in',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.65),
                    fontSize: 10,
                    height: 1.35,
                  ),
                ),
                const SizedBox(height: 6),

                // Course Title
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFF00D6D6),
                    fontWeight: FontWeight.w900,
                    fontSize: 15,
                  ),
                ),
                Text(
                  'Category: $category • Level: $level',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.5),
                    fontSize: 9.5,
                  ),
                ),
                const SizedBox(height: 16),

                // Footer Signatures & Registry
                Container(
                  padding: const EdgeInsets.only(top: 10),
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Jay Kumar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 11)),
                          Text('Lead Course Architect', style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 9)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00D6D6).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text('OFFICIAL SEAL', style: TextStyle(color: Color(0xFF00D6D6), fontSize: 8, fontWeight: FontWeight.w800)),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text('TG-LOCKED-PREVIEW', style: TextStyle(fontFamily: 'monospace', color: Colors.white, fontWeight: FontWeight.w800, fontSize: 10)),
                          Text('techgration.live/verify', style: TextStyle(color: const Color(0xFF00D6D6), fontSize: 8.5)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // FROSTED CYBER SECURITY OVERLAY (When locked)
          if (!isUnlocked)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF0B132B).withValues(alpha: 0.88),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Concentric Circular Lock Ring with Progress %
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF0F172A),
                        border: Border.all(color: const Color(0xFF00D6D6), width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF00D6D6).withValues(alpha: 0.25),
                            blurRadius: 16,
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.lock_rounded, size: 20, color: Color(0xFFF59E0B)),
                          const SizedBox(height: 2),
                          Text(
                            '$progress%',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Badge: CERTIFICATE LOCKED • IN PROGRESS
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.lock_clock_rounded, size: 12, color: Color(0xFFF59E0B)),
                          SizedBox(width: 5),
                          Text(
                            'CERTIFICATE LOCKED • IN PROGRESS',
                            style: TextStyle(
                              color: Color(0xFFF59E0B),
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Heading
                    const Text(
                      'Complete this course to unlock your cryptographically verified certificate.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 14,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 6),

                    // Subtitle
                    Text(
                      'Attend live classes, finish study modules, and submit assignments to unlock your official credential.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 11,
                        height: 1.35,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // 3 Feature Pill Tags (Matching Web LMS Screenshot 2)
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      alignment: WrapAlignment.center,
                      children: [
                        _buildFeatureTag(icon: Icons.shield_outlined, label: 'SHA-256 Validated'),
                        _buildFeatureTag(icon: Icons.public_rounded, label: 'Public Registry'),
                        _buildFeatureTag(icon: Icons.picture_as_pdf_outlined, label: 'Vector PDF Export'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildFeatureTag({required IconData icon, required String label}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: const Color(0xFF00D6D6)),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }

  Widget _buildCertSegmentPill({
    required String label,
    required IconData icon,
    required Color iconColor,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: iconColor),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? AppColors.textPrimary : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEarnedCertificateCard(BuildContext context, Map<String, dynamic> cert) {
    final title = cert['courseTitle'] as String? ?? 'Verified Certificate';
    final code = cert['code'] as String? ?? 'TG-CERT';
    final studentName = cert['studentName'] as String? ?? 'Student';
    final instructor = cert['instructorName'] as String? ?? 'TechGration Faculty';

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFF14B8A6).withValues(alpha: 0.4), width: 1.5),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFF14B8A6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.verified_rounded, color: Color(0xFF0D9488), size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800, fontSize: 15),
                    ),
                    Text(
                      'Awarded to $studentName • Instructor: $instructor',
                      style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Row(
              children: [
                const Icon(Icons.qr_code_2_rounded, size: 16, color: Color(0xFF0D9488)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    code,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: Color(0xFF0D9488),
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const Text(
                  'VERIFIED',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF0D9488),
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRealCourseCredentialCard(BuildContext context, Map<String, dynamic> item) {
    final course = item['courseTitle'] as String? ??
        item['course']?['title'] as String? ??
        item['title'] as String? ??
        'Course';
    final instructor = item['instructorName'] as String? ??
        item['course']?['instructorName'] as String? ??
        item['course']?['instructor']?['name'] as String? ??
        item['instructor'] as String? ??
        'TechGration Faculty';
    final progress = (item['progressPct'] as num?)?.round() ?? 0;
    final isComplete = progress >= 100;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFF00D6D6).withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.workspace_premium_rounded, color: Color(0xFF008A8A), size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      course,
                      style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800, fontSize: 15),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      'Instructor: $instructor',
                      style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary, fontSize: 12),
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
              Text(
                'Course Progress to Certification',
                style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
              ),
              Text(
                '$progress% Completed',
                style: AppTypography.bodySmall.copyWith(
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF008A8A),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: (progress / 100.0).clamp(0.0, 1.0),
              minHeight: 7,
              backgroundColor: AppColors.divider,
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF00D6D6)),
            ),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Row(
              children: [
                const Icon(Icons.qr_code_2_rounded, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    isComplete ? 'Ready to Claim Official Certificate' : 'TG-CERT-PENDING',
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                Text(
                  isComplete ? 'UNLOCKED' : '100% Required',
                  style: AppTypography.bodySmall.copyWith(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: isComplete ? const Color(0xFF047857) : AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 4. Milestones & Badges Tab (3D Flippable Badges bound to real MongoDB metrics)
  Widget _buildMilestonesTab(BuildContext context, AcademicsState academics) {
    final milestones = academics.milestones;

    return RefreshIndicator(
      color: const Color(0xFF00D6D6),
      onRefresh: () => ref.read(academicsProvider.notifier).loadAll(),
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Engineering Badges',
                style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800),
              ),
              Text(
                'Tap to flip 3D',
                style: AppTypography.bodySmall.copyWith(
                  color: const Color(0xFF008A8A),
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          if (milestones.isNotEmpty)
            GridView.builder(
              itemCount: milestones.length,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 14,
                mainAxisSpacing: 14,
                childAspectRatio: 1.15,
              ),
              itemBuilder: (context, idx) {
                final m = milestones[idx] as Map<String, dynamic>;
                final rarity = m['rarity'] as String? ?? 'COMMON';
                final isUnlocked = m['isUnlocked'] as bool? ?? false;

                Color bg;
                Color text;
                if (!isUnlocked) {
                  bg = AppColors.surfaceLight;
                  text = AppColors.textMuted;
                } else if (rarity == 'MYTHIC') {
                  bg = const Color(0xFFFEF3C7);
                  text = const Color(0xFFB45309);
                } else if (rarity == 'LEGENDARY') {
                  bg = const Color(0xFFE0F2FE);
                  text = const Color(0xFF0284C7);
                } else if (rarity == 'EPIC') {
                  bg = const Color(0xFFF3E8FF);
                  text = const Color(0xFF7E22CE);
                } else {
                  bg = const Color(0xFFDCFCE7);
                  text = const Color(0xFF15803D);
                }

                return FlippableBadgeCard(
                  emoji: m['emoji'] as String? ?? '🏆',
                  title: m['title'] as String? ?? 'Milestone',
                  subtitle: m['subtitle'] as String? ?? '',
                  rarity: rarity,
                  unlockedDate: isUnlocked ? (m['unlockedDate'] as String? ?? 'Unlocked') : 'Locked',
                  bgColor: bg,
                  textColor: text,
                );
              },
            )
          else
            _buildEmptyTabCard(
              icon: Icons.emoji_events_outlined,
              iconColor: const Color(0xFFF59E0B),
              title: 'No Badges Loaded',
              description: 'Badges are dynamically unlocked as you complete lessons, pass assessments, and rank on the leaderboard.',
            ),

          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _buildEmptyTabCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String description,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 16),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.12),
              shape: BoxShape.circle,
              border: Border.all(color: iconColor.withValues(alpha: 0.3)),
            ),
            child: Icon(
              icon,
              size: 28,
              color: iconColor,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: AppTypography.headlineMedium.copyWith(
              fontWeight: FontWeight.w800,
              fontSize: 17,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          Text(
            description,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
              height: 1.45,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
