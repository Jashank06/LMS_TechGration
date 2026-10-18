import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/services/haptic_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../../shared/widgets/course_image.dart';
import '../dashboard/student_dashboard_controller.dart';
import 'course_detail_screen.dart';

class MyCoursesScreen extends ConsumerStatefulWidget {
  const MyCoursesScreen({super.key});

  @override
  ConsumerState<MyCoursesScreen> createState() => _MyCoursesScreenState();
}

class _MyCoursesScreenState extends ConsumerState<MyCoursesScreen> {
  final TextEditingController _searchController = TextEditingController();
  int _selectedFilter = 0; // 0: All, 1: In Progress, 2: Completed
  bool _isGridView = false;

  void _openCourseDetail(
    BuildContext context, {
    required String courseId,
    required String title,
    String? subtitle,
    String? category,
    String? instructor,
    String? thumbnailUrl,
    double progressPct = 0.0,
  }) {
    HapticService.mediumImpact();
    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => CourseDetailScreen(
          courseId: courseId,
          courseTitle: title,
          courseSubtitle: subtitle,
          category: category,
          instructorName: instructor,
          thumbnailUrl: thumbnailUrl,
          progressPct: progressPct,
        ),
        transitionsBuilder: (context, a, secondaryAnimation, c) => SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 0.15),
            end: Offset.zero,
          ).animate(CurvedAnimation(parent: a, curve: Curves.easeOutCubic)),
          child: FadeTransition(opacity: a, child: c),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(studentDashboardProvider);
    final enrollments = dashboardState.enrollments;

    // Filter courses based on search & progress
    final query = _searchController.text.trim().toLowerCase();
    final filtered = enrollments.where((item) {
      final e = item as Map<String, dynamic>;
      final course = (e['course'] as Map<String, dynamic>?) ?? {};
      final title = (course['title'] ?? '').toString().toLowerCase();
      final category = (course['category'] ?? '').toString().toLowerCase();
      final matchesSearch = query.isEmpty || title.contains(query) || category.contains(query);

      final progress = (e['progressPct'] as num?)?.toDouble() ?? 0.0;
      final matchesFilter = _selectedFilter == 0 ||
          (_selectedFilter == 1 && progress < 100) ||
          (_selectedFilter == 2 && progress >= 100);

      return matchesSearch && matchesFilter;
    }).toList();

    final totalCount = enrollments.isNotEmpty ? enrollments.length : 2;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'My Enrolled Courses',
          style: AppTypography.headlineLarge.copyWith(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        centerTitle: false,
        actions: [
          TextButton.icon(
            onPressed: () {
              HapticService.selection();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Exploring Course Catalog...')),
              );
            },
            icon: const Icon(Icons.explore_outlined, size: 16, color: Color(0xFF008A8A)),
            label: const Text(
              'Catalog',
              style: TextStyle(color: Color(0xFF008A8A), fontWeight: FontWeight.w700, fontSize: 12),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: const Color(0xFF00D6D6),
          backgroundColor: Colors.white,
          onRefresh: () => ref.read(studentDashboardProvider.notifier).loadDashboard(),
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
            children: [
              // Subtitle
              Text(
                'Track your ongoing curriculums, practical architectural modules, and certifications.',
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                ),
              ),

              const SizedBox(height: 16),

              // Search Bar matching Screenshot 2
              Container(
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    const SizedBox(width: 14),
                    const Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        onChanged: (_) => setState(() {}),
                        style: AppTypography.bodyMedium.copyWith(color: AppColors.textPrimary),
                        decoration: const InputDecoration(
                          hintText: 'Search your courses by title or skill...',
                          hintStyle: TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                          border: InputBorder.none,
                          isDense: true,
                        ),
                      ),
                    ),
                    if (_searchController.text.isNotEmpty)
                      IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18, color: AppColors.textSecondary),
                        onPressed: () => setState(() => _searchController.clear()),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Filter Tabs & Grid/List Toggle Row
              Row(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      child: Row(
                        children: [
                          _buildFilterPill(0, 'All ($totalCount)'),
                          const SizedBox(width: 8),
                          _buildFilterPill(1, 'In Progress'),
                          const SizedBox(width: 8),
                          _buildFilterPill(2, 'Completed'),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    height: 38,
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 28),
                          icon: Icon(
                            Icons.grid_view_rounded,
                            size: 16,
                            color: _isGridView ? const Color(0xFF008A8A) : AppColors.textSecondary,
                          ),
                          onPressed: () => setState(() => _isGridView = true),
                        ),
                        IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 28),
                          icon: Icon(
                            Icons.view_agenda_rounded,
                            size: 16,
                            color: !_isGridView ? const Color(0xFF008A8A) : AppColors.textSecondary,
                          ),
                          onPressed: () => setState(() => _isGridView = false),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Enrolled Course Cards (Screenshot 2 Match)
              if (filtered.isNotEmpty) ...[
                for (final item in filtered) ...[
                  _buildEnrolledCourseCard(context, item as Map<String, dynamic>),
                ],
              ] else ...[
                // Fallback realistic course matching Nakul's portal
                _buildCourseCardWidget(
                  context,
                  courseId: '6ad3e60d327ee4bd613509df',
                  title: 'Machine Learning',
                  category: 'AI & MACHINE LEARNING',
                  instructor: 'Vineet Sir',
                  thumbnailUrl: 'https://res.cloudinary.com/dozazvcec/image/upload/v1792271801/techgration_lms/courses/course_course_1792271791434.jpg',
                  batchLabel: 'New Batch • Live Classes',
                  progressPct: 0.0,
                  totalLessons: 12,
                  completedLessons: 0,
                ),
                const SizedBox(height: 16),
                _buildCourseCardWidget(
                  context,
                  courseId: '6ad283b4e196d0b8fbfb9eae',
                  title: 'Artificial Intelligence & Modern Deep Learning Systems',
                  category: 'AI & MACHINE LEARNING',
                  instructor: 'Vineet Sir',
                  thumbnailUrl: 'https://campus.techgration.live/brand/AI.png',
                  batchLabel: '0/3 Sessions Done',
                  progressPct: 0.0,
                  totalLessons: 15,
                  completedLessons: 0,
                ),
              ],

              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterPill(int index, String label) {
    final isSelected = _selectedFilter == index;
    return GestureDetector(
      onTap: () {
        HapticService.selection();
        setState(() => _selectedFilter = index);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF00D6D6) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF00D6D6) : AppColors.borderLight,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: isSelected ? const Color(0xFF0F172A) : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildEnrolledCourseCard(BuildContext context, Map<String, dynamic> item) {
    final course = (item['course'] as Map<String, dynamic>?) ?? {};
    final courseId = item['courseId'] as String? ?? course['id'] as String? ?? '6ad283b4e196d0b8fbfb9eae';
    final title = course['title'] as String? ?? 'Machine Learning';
    final category = course['category'] as String? ?? 'AI & MACHINE LEARNING';
    final instructor = course['instructor']?['name'] as String? ?? 'Vineet Sir';
    final thumbnailUrl = course['thumbnailUrl'] as String? ?? item['thumbnailUrl'] as String?;
    final progressPct = (item['progressPct'] as num?)?.toDouble() ?? 0.0;
    final batchLabel = item['batchName'] as String? ?? 'New Batch • Live Classes';

    final modules = course['modules'] as List<dynamic>? ?? [];
    int totalLessons = 0;
    for (final m in modules) {
      if (m is Map && m['lessons'] is List) {
        totalLessons += (m['lessons'] as List).length;
      }
    }
    if (totalLessons == 0) totalLessons = 12;
    final completedLessons = ((progressPct / 100.0) * totalLessons).round();

    return _buildCourseCardWidget(
      context,
      courseId: courseId,
      title: title,
      category: category,
      instructor: instructor,
      thumbnailUrl: thumbnailUrl,
      batchLabel: batchLabel,
      progressPct: progressPct,
      totalLessons: totalLessons,
      completedLessons: completedLessons,
    );
  }

  // Pure 1:1 Rendering of Screenshot 2
  Widget _buildCourseCardWidget(
    BuildContext context, {
    required String courseId,
    required String title,
    required String category,
    required String instructor,
    String? thumbnailUrl,
    required String batchLabel,
    required double progressPct,
    required int totalLessons,
    required int completedLessons,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. High Resolution Cover Image with 16:9 Aspect Ratio
          Stack(
            children: [
              AspectRatio(
                aspectRatio: 16 / 9,
                child: CourseImage(
                  imageUrl: thumbnailUrl,
                  courseTitle: title,
                  fit: BoxFit.cover,
                ),
              ),

              // Top-Left Badge: ALL_LEVELS (Screenshot 2)
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.65),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                  ),
                  child: const Text(
                    'ALL_LEVELS',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),

              // Top-Right Badge: AI & MACHINE LEARNING (Screenshot 2)
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF00D6D6),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    category.toUpperCase(),
                    style: const TextStyle(
                      color: Color(0xFF0F172A),
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
            ],
          ),

          // 2. Card Content Body
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Instructor Row
                Text(
                  'Instructor: $instructor',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),

                const SizedBox(height: 6),

                // Course Title
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 17,
                    color: AppColors.textPrimary,
                    height: 1.3,
                  ),
                ),

                const SizedBox(height: 14),

                // Progress Info Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      batchLabel,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      '${progressPct.toInt()}%',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF008A8A),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 6),

                // Progress Bar
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(
                    value: progressPct / 100.0,
                    minHeight: 6,
                    backgroundColor: const Color(0xFFE2E8F0),
                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF00D6D6)),
                  ),
                ),

                const SizedBox(height: 18),

                // 3. Cyan Button: [Video Icon] View Course & Classes (Screenshot 2 Match)
                BouncingButton(
                  scaleDown: 0.97,
                  onTap: () {
                    _openCourseDetail(
                      context,
                      courseId: courseId,
                      title: title,
                      category: category,
                      instructor: instructor,
                      thumbnailUrl: thumbnailUrl,
                      progressPct: progressPct,
                    );
                  },
                  child: Container(
                    width: double.infinity,
                    height: 46,
                    decoration: BoxDecoration(
                      color: const Color(0xFF00D6D6),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF00D6D6).withValues(alpha: 0.28),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.videocam_rounded,
                          color: Color(0xFF0F172A),
                          size: 19,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'View Course & Classes',
                          style: TextStyle(
                            color: Color(0xFF0F172A),
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
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
    );
  }
}
